 

    function make_base_auth(user, password) {
    return "Basic " + btoa(user + ":" + password);
}

    const username = "coffe";
    const password = "kafe";
    const AUTH_HEADER = make_base_auth(username, password);
    async function getTypesList(apiUrl) {
    const res = await fetch(`${apiUrl}?cmd=getTypesList`, {
    method: 'GET',
    credentials: 'include',
    headers: {
    'Authorization': AUTH_HEADER
}
});
    if (!res.ok) throw new Error(`getTypesList HTTP ${res.status}`);
    return await res.json();
}

    const getNames = async () => {
    const obj = {}
    const res = await fetch("https://crm.skch.cz/ajax0/procedure2.php?cmd=getPeopleList", {
    method: 'GET',
    credentials:"include",
    headers:{
    'Authorization': AUTH_HEADER
}
})
    const data = await res.json()
    for (let key of Object.keys(data)) {
    obj[data[key]["ID"]] = data[key]["name"]
}
    return obj
}

    const getDrinks = async () => {
    const arr = []
    const res = await fetch("https://crm.skch.cz/ajax0/procedure2.php?cmd=getTypesList",{
    method: 'GET',
    credentials: 'include',
    header:{
    'Authorization': AUTH_HEADER
}
})
    const data = await res.json()
    for (let key of Object.keys(data)) {
    arr.push(data[key]["typ"])
}
    return arr
}


    const getSummaryOfDrinks = async () => {
    const res = await fetch("https://crm.skch.cz/ajax0/procedure2.php?cmd=getSummaryOfDrinks", {
    method: 'GET',
    credentials:"include",
    headers:{
    'Authorization': AUTH_HEADER
}
})
    return await res.json()
}

    const values = {}

    document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector("#names")
    const form = document.querySelector("form")
    const statsContainer = document.querySelector("#global-stats")


    const refreshStats = async () => {
    const data = await getSummaryOfDrinks()
    statsContainer.innerHTML = ""
    data.forEach(item => {
    const row = document.createElement("div")
    row.className = "stat-item"
    row.innerHTML = `<span>${item[0]}</span> <strong>${item[1]}</strong>`
    statsContainer.appendChild(row)
})
}


    refreshStats()

    getNames().then(o => {
    for (let key of Object.keys(o)) {
    const option = document.createElement("option")
    option.value = key
    option.textContent = o[key]
    select.appendChild(option)
}
})

    getDrinks().then(arr => {
    const ul = document.querySelector("#drinks")
    arr.forEach(drink => {
    values[drink] = 0
    const li = document.createElement("li")
    li.innerHTML = `
                <span>${drink}</span>
                <div class="counter-group">
                    <button type="button" class="minus-btn">-</button>
                    <span class="val-display">0</span>
                    <button type="button" class="plus-btn">+</button>
                </div>
            `
    const mBtn = li.querySelector(".minus-btn")
    const pBtn = li.querySelector(".plus-btn")
    const disp = li.querySelector(".val-display")

    pBtn.onclick = () => {
    values[drink]++
    disp.textContent = values[drink]
}
    mBtn.onclick = () => {
    if (values[drink] > 0) {
    values[drink]--
    disp.textContent = values[drink]
}
}
    ul.appendChild(li)
})
})

    form.addEventListener("submit", async (e) => {
    e.preventDefault()
    const payload = {
    user: select.value,
    drinks: Object.keys(values).map(drink => ({
    type: drink,
    value: values[drink]
}))
}

    try {
    await fetch("https://crm.skch.cz/ajax0/procedure2.php?cmd=saveDrinks", {
    method: "POST",
    headers: { "Content-Type": "application/json",
    'Authorization': AUTH_HEADER
},
    credentials: "include",
    body: JSON.stringify(payload)
})

    Object.keys(values).forEach(d => values[d] = 0)
    document.querySelectorAll(".val-display").forEach(s => s.textContent = "0")

    refreshStats()
} catch (err) {
    console.error("Save failed:", err)
}
})
})
