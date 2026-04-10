const winnerTemplate = ({ displayName, targetTitle, score }) => `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Winnaar!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
  <h2>Gefeliciteerd ${displayName || "winnaar"}!</h2>
  <p>Je bent de winnaar van <strong>${targetTitle || "de target"}</strong>.</p>
  <p>Jouw eindscore: <strong>${score ?? "-"}</strong>.</p>
  <p>We nemen snel contact op over de prijs.</p>
</body>
</html>
`;

export default winnerTemplate;
