import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { error } from 'console';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const targetDir = path.join(__dirname, 'clonedRepos');

const getRepos = async (username) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`);
        return response.data;
    } catch {
        console.log(error.message);
        return [];
    }
}

const getSpecificRepo = async (username, repoName) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos/${repoName}`)
        return response.data;
    } catch(error) {
        console.log(error.message);
        return;
    }
}

const cloneRepo = (repoUrl, targetDir) => {
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
}

const getEstimatedTime = (publicRepos, targetDir) => {
    let time = 0;

    for(const repo of publicRepos) {
        const repoPath = path.join(targetDir, repo.name);

        const hours = calculateEstimate(repoPath);
        time += hours;
    }
    return time;
}

const removeOldRepos = (targetDir) => {
    // Clean up existing directory
    if(fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
    }
    // Create fresh directory
    fs.mkdirSync(targetDir, { recursive: true });
}

export async function estimateTime(username) {

    //fix targetDir at initialisation
    const targetDir = path.join(targetDir, username);
    removeOldRepos(targetDir);

    const publicRepos = await getRepos(username);

    for (const repo of publicRepos) {
        const repoUrl = repo.clone_url;
        cloneRepo(repoUrl, targetDir);
    }

    const totalHours = getEstimatedTime(publicRepos, targetDir);
    const roundedHours = Math.round(totalHours);

    console.log(`Estimated total hours: ${roundedHours} h`);
    return roundedHours;
}