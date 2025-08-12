export default function handler(req, res) {
  const gifs = [
    "https://media.giphy.com/media/M9gbBd9nbDrOTu1Mqx/giphy.gif",
    "https://i.pinimg.com/originals/47/f0/34/47f0342cec72b800463bf003eac1257e.gif",
    "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
    "https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif",
    "https://media.giphy.com/media/LMt9638dO8dftAjtco/giphy.gif"
  ];

  const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

  // Prevent GitHub from caching
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.writeHead(302, { Location: randomGif });
  res.end();
}
