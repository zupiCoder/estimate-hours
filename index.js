const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

const targetDir = path.resolve(__dirname, 'clonedRepos'); //absolute path to the directory where we want to clone the repos
const USERNAME = 'zupiCoder';
const publicRepos = [];

if(!fs.existsSync(targetDir)) {
    //if the directory does not exist, create it
    fs.mkdirSync(targetDir, { recursive: true });
}

//response is a promise here
//async function automatically returns a Promise even if we dont explicitly return anything
//Non-Blocking: While your function is "paused" at an await, JavaScript continues running other code.

const getRepos = async () => {
    try {
        //The Await Keyword: Inside an async function, await pauses execution until a Promise resolves, then returns its value.
        const response = await axios.get(`https://api.github.com/users/${USERNAME}/repos`);
        //after we get the response from the api call we push the repos into an array
        response.data.forEach(repo => {
            publicRepos.push(repo);
        });
    } catch (error) {
        console.error('Error fetching repositories:', error.message);
    }
}

const cloneRepo = async (repo) => {
    try {
        //child processes : completely isolated from the main process, allowing you to run commands as if you were in a terminal
        //exec is a function that takes a command and a callback function
        //spawn is used to run a command in a child process, for cloneing a repo

        //ADDITION -> instead of cloning the whole repo, clone only the .git folder
        //[[spawn('git', ['clone', '--no-checkout', '--filter=blob:none', '--depth=1', repo.clone_url],]]
        return new Promise((resolve, reject) => {
            //Any code using await cloneRepo() will pause until the Promise resolves
            const gitCloneProcess = spawn('git', ['clone', repo.clone_url], {cwd: targetDir});

            //exit handler
            gitCloneProcess.on('exit', (code) => {
                resolve(code);
            });
        });
    } catch (error) {
        console.error('Error cloning repository:', error.message);
    }
};

const getEstimatedTime = async () => {
    let time = 0;
    
    for (const repo of publicRepos) {
        const repoPath = path.join(targetDir, repo.name);
        const hours = await calculateEstimate(repoPath);
        time += hours;
    }
    return time;
};

const calculateEstimate = (repoPath) => {
    return new Promise((resolve, reject) => {
        const command = `ein tool estimate-hours ${repoPath}`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                resolve(0);
                return;
            }
            
            const lines = stdout.split('\n');
            const totalHoursLine = lines.find(line => line.includes('total hours'));
            let hours = 0;
            
            if(totalHoursLine) {
                const parts = totalHoursLine.split(':');
                hours = parseFloat(parts[1].trim());
            }
            resolve(hours);
        });
    });
};

async function main() {
    try {
        await getRepos();
        
        for (let i = 0; i < publicRepos.length; i++) {
            const repo = publicRepos[i];
            await cloneRepo(repo);
        }
        
        const totalTime = await getEstimatedTime();
        console.log(`Total estimated development time: ${totalTime} hours`);
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

main();
