$ErrorActionPreference = 'Stop'

$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
$HostName = '127.0.0.1'
$PreferredPorts = @(5173, 3000, 4173, 8080, 8000, 9000)

function Test-PortAvailable {
    param([int]$Port)

    $listener = $null
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($HostName), $Port)
        $listener.Start()
        return $true
    } catch {
        return $false
    } finally {
        if ($listener) {
            $listener.Stop()
        }
    }
}

function Get-DynamicPort {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($HostName), 0)
    $listener.Start()
    $port = $listener.LocalEndpoint.Port
    $listener.Stop()
    return $port
}

function Get-LaunchPorts {
    $ports = New-Object System.Collections.Generic.List[int]
    foreach ($port in $PreferredPorts) {
        if ((Test-PortAvailable $port) -and -not $ports.Contains($port)) {
            $ports.Add($port)
        }
    }

    for ($i = 0; $i -lt 3; $i++) {
        $dynamicPort = Get-DynamicPort
        if (-not $ports.Contains($dynamicPort)) {
            $ports.Add($dynamicPort)
        }
    }

    return $ports
}

function Start-CheckedProcess {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [int]$Port
    )

    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -WorkingDirectory $Root -NoNewWindow -PassThru
    Start-Sleep -Milliseconds 900

    if ($process.HasExited) {
        Write-Host "Port $Port failed with $FilePath. Trying another strategy..."
        return $null
    }

    try {
        Invoke-WebRequest -Uri "http://$HostName`:$Port/" -UseBasicParsing -TimeoutSec 2 | Out-Null
        return $process
    } catch {
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id -Force
        }
        return $null
    }
}

function Start-PowerShellStaticServer {
    param([int]$Port)

    $listener = [System.Net.HttpListener]::new()
    $listener.Prefixes.Add("http://$HostName`:$Port/")
    $listener.Start()
    Write-Host "Serving $Root"
    Write-Host "Local URL: http://$HostName`:$Port/"
    Start-Process "http://$HostName`:$Port/"

    try {
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
            if ([string]::IsNullOrWhiteSpace($requestPath)) {
                $requestPath = 'index.html'
            }

            $candidate = [System.IO.Path]::GetFullPath((Join-Path $Root $requestPath))
            if (-not $candidate.StartsWith($Root.Path, [System.StringComparison]::OrdinalIgnoreCase)) {
                $context.Response.StatusCode = 403
                $context.Response.Close()
                continue
            }

            if ((Test-Path $candidate -PathType Container)) {
                $candidate = Join-Path $candidate 'index.html'
            }

            if (-not (Test-Path $candidate -PathType Leaf)) {
                $context.Response.StatusCode = 404
                $context.Response.Close()
                continue
            }

            $bytes = [System.IO.File]::ReadAllBytes($candidate)
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
            $context.Response.Close()
        }
    } finally {
        $listener.Stop()
    }
}

$node = Get-Command node -ErrorAction SilentlyContinue
$python = Get-Command python -ErrorAction SilentlyContinue
$py = Get-Command py -ErrorAction SilentlyContinue

foreach ($port in Get-LaunchPorts) {
    if ($node) {
        $args = @((Join-Path $Root 'scripts\local-static-server.mjs'), "--root=$Root", "--port=$port", "--host=$HostName")
        $process = Start-CheckedProcess -FilePath $node.Source -Arguments $args -Port $port
        if ($process) {
            $url = "http://$HostName`:$port/"
            Write-Host "Opened $url"
            Start-Process $url
            Wait-Process -Id $process.Id
            exit 0
        }
    }

    if ($python) {
        $args = @('-m', 'http.server', "$port", '--bind', $HostName, '--directory', "$Root")
        $process = Start-CheckedProcess -FilePath $python.Source -Arguments $args -Port $port
        if ($process) {
            $url = "http://$HostName`:$port/"
            Write-Host "Opened $url"
            Start-Process $url
            Wait-Process -Id $process.Id
            exit 0
        }
    }

    if ($py) {
        $args = @('-3', '-m', 'http.server', "$port", '--bind', $HostName, '--directory', "$Root")
        $process = Start-CheckedProcess -FilePath $py.Source -Arguments $args -Port $port
        if ($process) {
            $url = "http://$HostName`:$port/"
            Write-Host "Opened $url"
            Start-Process $url
            Wait-Process -Id $process.Id
            exit 0
        }
    }
}

foreach ($port in Get-LaunchPorts) {
    try {
        Start-PowerShellStaticServer -Port $port
        exit 0
    } catch {
        Write-Host "PowerShell static server failed on port $port. Trying another port..."
    }
}

Write-Error "Could not start a local server on any fallback port."
exit 1

