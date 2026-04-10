const registrationTemplate = ({ displayName, targetTitle }) => `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registratiebevestiging</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
  <h2>Welkom ${displayName || "deelnemer"}!</h2>
  <p>Je registratie voor <strong>${targetTitle || "de target"}</strong> is succesvol verwerkt.</p>
  <p>Veel succes en plezier!</p>
  <p>Groet,<br />Photo Prestiges Team</p>
</body>
</html>
`;

export default registrationTemplate;
