const scoreResultTemplate = ({ displayName, targetTitle, score }) => `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jouw score-resultaat</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
  <h2>Hi ${displayName || "deelnemer"},</h2>
  <p>Je score voor <strong>${targetTitle || "de target"}</strong> is bekend.</p>
  <p><strong>Behaalde score: ${score ?? "-"}</strong></p>
  <p>Dank voor je inzending.</p>
</body>
</html>
`;

export default scoreResultTemplate;
