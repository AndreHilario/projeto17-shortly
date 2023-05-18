import { db } from "../database/database.connection.js";


export async function getUsers(req, res) {

    const { userId } = res.locals;

    try {

        const userInfos = await db.query(
            `
                SELECT users.id AS user_id, users.name AS user_name, 
                    urls.id AS url_id, urls."shortUrl", urls.url, SUM(urls."visitCount") AS url_visit_count
                FROM urls
                JOIN users 
                    ON urls."userId" = users.id
                WHERE users.id = $1
                GROUP BY users.id, users.name, urls.id;
            `, [userId]);

        const correctUserInfos = {
            id: userInfos.rows[0].user_id,
            name: userInfos.rows[0].user_name,
            visitCount: 0,
            shortenedUrls: []
        };

        userInfos.rows.forEach((row) => {
            correctUserInfos.visitCount += Number(row.url_visit_count);
            correctUserInfos.shortenedUrls.push({
                id: row.url_id,
                shortUrl: row.shortUrl,
                url: row.url,
                visitCount: Number(row.url_visit_count)
            });
        });


        res.status(200).send(correctUserInfos);

    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getRanking(req, res) {

    try {

        const ranking = await db.query(
            `
                SELECT users.id AS id, users.name AS name, 
                    COUNT(urls.id) AS "linksCount",
                    COALESCE(SUM(urls."visitCount"), 0) AS "visitCount"
                FROM users
                LEFT JOIN urls
                    ON urls."userId" = users.id
                GROUP BY users.id, users.name
                ORDER BY "visitCount" DESC
                LIMIT 10;
            `
        );
        console.log(ranking)
        const rankingResponse = ranking.rows.map((row) => ({
            id: row.id,
            name: row.name,
            linksCount: Number(row.linksCount),
            visitCount: Number(row.visitCount)
        }));

        res.status(200).send(rankingResponse);

    } catch (err) {
        res.status(500).send(err.message);
    }
}