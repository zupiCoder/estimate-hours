const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { exec, spawn, execSync } = require('child_process');
const { error } = require('console');
const { stderr, cwd } = require('process');
const prompt = require('prompt-sync')();


const USERNAME = prompt('Enter GitHub username: ').trim();

const targetDir = path.join(__dirname, 'clonedRepos');

if(fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
}

fs.mkdirSync(targetDir, { recursive: true });

const getRepos = async () => {
    try {
        const response = await axios.get(`https://api.github.com/users/${USERNAME}/repos`);
        return response.data;
    } catch {
        console.log(error.message);
        return [];
    }
}

const cloneRepo = (repoUrl) => {
    execSync(`git clone --no-checkout ${repoUrl}`, {cwd: targetDir});
}

const calculateEstimate = (repoPath) => {
    try {
        const command = `ein tool estimate-hours ${repoPath}`;
        const stdout = execSync(command, { encoding: 'utf-8' });

        const lines = stdout.split('\n');
        const totalHoursLine = lines.find(line => line.includes('total hours'));
        let hours = 0;

        if (totalHoursLine) {
            const parts = totalHoursLine.split(':');
            hours = parseFloat(parts[1].trim()) || 0;
        }

        return hours;
    } catch (error) {
        console.error(`Estimation failed for ${repoPath}: ${error.message}`);
        return 0;
    }
};

const getEstimatedTime = (publicRepos) => {
    let time = 0;

    for(const repo of publicRepos) {
        const repoPath = path.join(targetDir, repo.name);

        const hours = calculateEstimate(repoPath);
        time += hours;
    }
    return time;
}

async function main() {
    const publicRepos = await getRepos();

    for (const repo of publicRepos) {
        const repoUrl = repo.clone_url;
        cloneRepo(repoUrl);
    }

    const totalHours = getEstimatedTime(publicRepos);
    const roundedHours = Math.round(totalHours);

    console.log(`Estimated total hours: ${roundedHours} h`);
}

main();