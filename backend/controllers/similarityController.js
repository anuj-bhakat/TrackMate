import { checkFileSimilarity } from "../services/similarityService.js";

export async function similarityCheck(req, res) {
  try {
    const { targetUrl, otherUrls } = req.body;

    if (!targetUrl || !otherUrls || !Array.isArray(otherUrls)) {
      return res.status(400).json({ error: "targetUrl and otherUrls[] required" });
    }

    const similarFiles = await checkFileSimilarity(targetUrl, otherUrls);

    res.json({ similarFiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
