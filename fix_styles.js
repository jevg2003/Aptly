const fs = require('fs');
let content = fs.readFileSync('c:/Trabajos/Aptly/screens/RegisterScreen.tsx', 'utf8');

content = content.replace(
  '<MaterialCommunityIcons name="google" size={20} color="white" />',
  `<Image source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} style={{ width: 18, height: 18, marginRight: 8 }} />`
);

content = content.replace(
  /socialBtn: \{[^\}]+\},/,
  "socialBtn: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },"
);

fs.writeFileSync('c:/Trabajos/Aptly/screens/RegisterScreen.tsx', content);
console.log('Fixed');
