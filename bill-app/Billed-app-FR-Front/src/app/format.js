export const formatDate = (dateStr) => {
    //console.log(dateStr) //==format yyyy-mm-dd = 2021-11-22
    const date = new Date(dateStr)
        //console.log(date) //format= Mon Nov 22 2021 01:00:00 GMT+0100 (heure normale d’Europe centrale)
    const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date) //avec 'en' cela fonctionne parfaitement ...
    const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
    const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
    const month = mo.charAt(0).toUpperCase() + mo.slice(1)
        //console.log(`${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`) //format = 22 Nov. 21
    return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}

export const formatStatus = (status) => {
    switch (status) {
        case "pending":
            return "En attente"
        case "accepted":
            return "Accepté"
        case "refused":
            return "Refused"
    }
}