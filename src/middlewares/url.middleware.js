import { db } from "../database/database.connection.js";

export async function validateShortUrl(req, res, next) {

    const { id, shortUrl } = req.params;

    if (id) {
        const getUrl = await db.query(`SELECT * FROM urls WHERE id=$1;`, [id]);
        if (getUrl.rowCount === 0) return res.sendStatus(404);

        res.locals.getUrl = getUrl.rows[0];
    }

    if (shortUrl) {
        const getUrl = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`, [shortUrl]);
        if (getUrl.rowCount === 0) return res.sendStatus(404);

        res.locals.getUrl = getUrl.rows[0];
    }
    
    next();
}