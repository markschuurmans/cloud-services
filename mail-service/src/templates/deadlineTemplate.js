const deadlineTemplate = ({ displayName, competitionTitle, deadline }) => `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Deadline-notificatie</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
  <h2>Hallo ${displayName || "deelnemer"},</h2>
  <p>De wedstrijd <strong>${competitionTitle || "jouw competitie"}</strong> is gesloten.</p>
  <p>Deadline: ${deadline || "onbekend"}.</p>
  <p>Bedankt voor je deelname.</p>
</body>
</html>
`;

export default deadlineTemplate;
