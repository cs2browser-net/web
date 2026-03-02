export const costs = [
    {
        service: "VPS Server Hosting",
        provider: "Hetzner / FreakHosting",
        monthlyFee: "$25-$30",
        description: "Main server hosting for the website, API and Ingress"
    },
    {
        service: "Domain Registration",
        provider: "Cloudflare",
        monthlyFee: "$2",
        description: "cs2browser.net domain registration"
    },
    {
        service: "Cloudflare Pro",
        provider: "Cloudflare",
        monthlyFee: "$25",
        description: "Content delivery, DNS, DDoS Protection"
    }
];

export const totalMinCost = costs.reduce((sum, cost) => {
    const min = parseInt(cost.monthlyFee.split('-')[0].replace('$', ''));
    return sum + min;
}, 0);

export const totalMaxCost = costs.reduce((sum, cost) => {
    const max = parseInt(cost.monthlyFee.split('-')[1]?.replace('$', '') || cost.monthlyFee.replace('$', ''));
    return sum + max;
}, 0);