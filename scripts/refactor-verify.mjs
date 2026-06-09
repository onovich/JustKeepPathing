import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

function runStep(label, command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: projectRoot,
            shell: false
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (chunk) => {
            stdout += chunk;
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk;
        });
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
                return;
            }
            const error = new Error(`${label} failed with exit code ${code}`);
            error.stdout = stdout;
            error.stderr = stderr;
            reject(error);
        });
    });
}

function parseJsonStep(label, stdout) {
    try {
        return JSON.parse(stdout.trim());
    } catch (error) {
        error.message = `${label} returned non-JSON output: ${error.message}`;
        error.stdout = stdout;
        throw error;
    }
}

function getNpmRunCommand(scriptName) {
    if (process.platform === 'win32') {
        return {
            command: 'cmd.exe',
            args: ['/d', '/s', '/c', `npm run ${scriptName}`]
        };
    }
    return {
        command: 'npm',
        args: ['run', scriptName]
    };
}

function printFailure(error) {
    console.error(`[verify:refactor] ${error.message}`);
    if (error.stdout) {
        console.error('\n--- stdout ---');
        console.error(error.stdout.trimEnd());
    }
    if (error.stderr) {
        console.error('\n--- stderr ---');
        console.error(error.stderr.trimEnd());
    }
}

try {
    const checkCommand = getNpmRunCommand('check');
    await runStep('check', checkCommand.command, checkCommand.args);
    const browserSmoke = parseJsonStep(
        'browser smoke',
        (await runStep('browser smoke', process.execPath, ['scripts/browser-smoke.mjs'])).stdout
    );
    const screenshotSmoke = parseJsonStep(
        'screenshot smoke',
        (await runStep('screenshot smoke', process.execPath, ['scripts/browser-screenshot.mjs'])).stdout
    );

    const browserResult = browserSmoke.result || {};
    const screenshotResult = screenshotSmoke.result || {};
    console.log('refactor verification passed');
    console.log(`- check: ok`);
    console.log(`- browser smoke: ${browserSmoke.ok ? 'ok' : 'not ok'} phase=${browserResult.phase || 'unknown'} level=${browserResult.level ?? 'unknown'} canvas=${browserResult.canvasWidth || '?'}x${browserResult.canvasHeight || '?'}`);
    console.log(`- screenshot: ${screenshotSmoke.ok ? 'ok' : 'not ok'} phase=${screenshotResult.phase || 'unknown'} output=${screenshotSmoke.outputPath || 'unknown'}`);
} catch (error) {
    printFailure(error);
    process.exitCode = 1;
}
