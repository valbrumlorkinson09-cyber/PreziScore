export default async function handler(req, res) {
    try {
        const response = await fetch(
            "https://sportscore.com/api/widget/matches/?sport=football&limit=50"
        );

        if (!response.ok) {
            return res.status(response.status).json({
                error: "SportScore API error"
            });
        }

        const data = await response.json();

        res.setHeader(
            "Access-Control-Allow-Origin",
            "*"
        );

        res.setHeader(
            "Cache-Control",
            "s-maxage=30, stale-while-revalidate=60"
        );

        return res.status(200).json(data);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Impossible de charger les matchs"
        });
    }
}
