const path = require('path');
const core = require('@actions/core');
const exec = require('@actions/exec');
const GhostAdminApi = require('@tryghost/admin-api');

(async function main() {
    try {
        const url = core.getInput('api-url');
        const api = new GhostAdminApi({
            url,
            key: core.getInput('api-key'),
            version: 'canary'
        });
        const source = core.getInput('source')
        const basePath = path.join(process.env.GITHUB_WORKSPACE, source);
        const pkgPath = path.join(basePath, 'package.json');
        const themeName = core.getInput('theme-name') || require(pkgPath).name;
        const themeZip = `${themeName}.zip`;
        const zipPath = path.join(basePath, themeZip);
        const exclude = core.getInput('exclude') || '';

        // Create a zip
        await exec.exec(`zip -r ${themeZip} . -x *.git* *.zip yarn* npm* *routes.yaml *redirects.yaml *redirects.json ${exclude}`, [], {cwd: basePath});

        // Deploy it to the configured site
        await api.themes.upload({file: zipPath});
        console.log(`${themeZip} successfully uploaded.`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}());
