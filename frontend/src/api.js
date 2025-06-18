export async function getEstimation(username) {
    const response = await fetch(`http://localhost:8080/estimate-time?username=${username}`);

    const data = await response.json();

    console.log(data);

    return data;
}