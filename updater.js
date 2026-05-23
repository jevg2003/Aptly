const fs = require('fs');

let content = fs.readFileSync('c:/Trabajos/Aptly/screens/RegisterScreen.tsx', 'utf8');

content = content.replace(
  "const totalSteps = localRole === 'company' ? 4 : 3;",
  "const totalSteps = localRole === 'company' ? 6 : 3;"
);

content = content.replace(
  'const [selectedSectors, setSelectedSectors] = useState<string[]>([]);',
  `const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [businessArea, setBusinessArea] = useState('');
  const [customSector, setCustomSector] = useState('');
  const [isOtherSector, setIsOtherSector] = useState(false);`
);

content = content.replace(
  /const isCompanyIncomplete =[^;]+;/,
  `const finalSector = isOtherSector ? customSector : selectedSectors[0];
    const isCompanyIncomplete = localRole === 'company' && (!companyName || !taxId || !creationDate || !businessArea || !finalSector);`
);

content = content.replace(
  /industry: selectedSectors\.join\(\', \'\)/,
  'business_area: businessArea,\n          industry: finalSector'
);

const oldHandleNext = `    if (localRole === 'company') {
      if (companyStep === 1) {
        if (!companyName || !taxId) return showAlert('Por favor, ingresa el nombre de la empresa y NIT.');
        setCompanyStep(2);
      } else if (companyStep === 2) {
        if (!legalRepresentative || !creationDate) return showAlert('Por favor, ingresa el representante y la fecha.');
        setCompanyStep(3);
      } else if (companyStep === 3) {
        if (selectedSectors.length === 0) return showAlert('Selecciona al menos un sector.');
        setCompanyStep(4);
      } else {
        handleRegister();
      }
    } else {`;

const newHandleNext = `    if (localRole === 'company') {
      if (companyStep === 1) {
        if (!email) return showAlert('Por favor, ingresa tu correo.');
        setCompanyStep(2);
      } else if (companyStep === 2) {
        if (!password || password !== confirmPassword) return showAlert('Verifica tu contraseña.');
        setCompanyStep(3);
      } else if (companyStep === 3) {
        if (!companyName) return showAlert('Por favor, ingresa el nombre de la empresa.');
        setCompanyStep(4);
      } else if (companyStep === 4) {
        if (!taxId || !creationDate) return showAlert('Por favor, ingresa NIT y año de creación.');
        setCompanyStep(5);
      } else if (companyStep === 5) {
        if (!businessArea) return showAlert('Selecciona el área de la empresa.');
        setCompanyStep(6);
      } else {
        const finalSector = isOtherSector ? customSector : selectedSectors[0];
        if (!finalSector) return showAlert('Selecciona o escribe un sector.');
        if (isOtherSector) {
           supabase.from('business_sectors').insert({ name: finalSector }).then();
        }
        handleRegister();
      }
    } else {`;

content = content.replace(oldHandleNext, newHandleNext);

const startStr = "{localRole === 'company' && (";
const endStr = '                )}';

// Splitting logic to ensure correct JSX replacement
const preCompanyIndex = content.indexOf(startStr);
const postCompanyIndex = content.indexOf(endStr, preCompanyIndex) + endStr.length;

if (preCompanyIndex !== -1 && postCompanyIndex !== -1) {
  const pre = content.substring(0, preCompanyIndex);
  const post = content.substring(postCompanyIndex);
  const newSteps = `{localRole === 'company' && (
                  <>
                    {companyStep === 1 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Crea tu cuenta empresarial</Text>
                        <Text style={styles.questionSubtitle}>Ingresa con tu correo u opciones sociales.</Text>
                        
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                           <TouchableOpacity style={styles.socialBtn} onPress={() => showAlert('Autenticación con Google próximamente')}>
                              <MaterialCommunityIcons name="google" size={20} color="white" />
                              <Text style={styles.socialText}>Google</Text>
                           </TouchableOpacity>
                           <TouchableOpacity style={styles.socialBtn} onPress={() => showAlert('Autenticación con GitHub próximamente')}>
                              <MaterialCommunityIcons name="github" size={20} color="white" />
                              <Text style={styles.socialText}>GitHub</Text>
                           </TouchableOpacity>
                        </View>
                        
                        <View style={styles.divider}>
                           <View style={styles.dividerLine} />
                           <Text style={styles.dividerText}>o con tu correo electrónico</Text>
                           <View style={styles.dividerLine} />
                        </View>

                        <CustomInput placeholder="Correo institucional" value={email} onChangeText={setEmail} iconName="email-outline" />
                      </View>
                    )}

                    {companyStep === 2 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Seguridad de la cuenta</Text>
                        <Text style={styles.questionSubtitle}>Crea una contraseña segura para tu empresa.</Text>
                        <CustomInput placeholder="Contraseña segura" value={password} onChangeText={setPassword} iconName="lock-outline" isPassword />
                        <CustomInput placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} iconName="lock-check-outline" isPassword />
                      </View>
                    )}

                    {companyStep === 3 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>¡Hagamos crecer tu equipo! ¿Cuál es el nombre de tu empresa?</Text>
                        
                        <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 20 }}>
                          <TouchableOpacity onPress={pickImage} style={[styles.avatarPicker, { borderColor: COLORS.company, backgroundColor: 'rgba(255,0,92,0.05)' }]}>
                            {avatarUrl ? (
                              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                              <View style={styles.avatarPlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.company} />
                                <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>Logo empresa</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        </View>

                        <CustomInput placeholder="Nombre de la empresa / Razón Social" value={companyName} onChangeText={setCompanyName} iconName="office-building" />
                      </View>
                    )}

                    {companyStep === 4 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>Identidad corporativa</Text>
                        <Text style={styles.questionSubtitle}>Ingresa el ID fiscal y el año en que se fundó la empresa.</Text>
                        
                        <CustomInput placeholder="NIT / ID Fiscal" value={taxId} onChangeText={setTaxId} iconName="card-account-details-outline" />
                        <CustomInput placeholder="Año de creación (ej. 2015)" value={creationDate} onChangeText={setCreationDate} iconName="calendar" keyboardType="numeric" maxLength={4} />
                      </View>
                    )}

                    {companyStep === 5 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>¿En qué área opera la empresa?</Text>
                        <Text style={styles.questionSubtitle}>Selecciona el área principal de negocio.</Text>
                        <View style={{ gap: 12, marginTop: 10 }}>
                          {['Industrial', 'Servicio', 'Comercial'].map(area => (
                            <TouchableOpacity 
                               key={area}
                               style={[styles.areaCard, businessArea === area && styles.areaCardActive]}
                               onPress={() => setBusinessArea(area)}
                            >
                               <View style={styles.radioCircle}>
                                  {businessArea === area && <View style={styles.radioInner} />}
                               </View>
                               <Text style={[styles.areaText, businessArea === area && styles.areaTextActive]}>{area}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {companyStep === 6 && (
                      <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
                        <Text style={styles.questionTitle}>¿Qué sector destaca más?</Text>
                        <Text style={styles.questionSubtitle}>Elige un sector o añade el tuyo.</Text>
                        <View style={styles.sectorsContainer}>
                          <View style={styles.sectorsGrid}>
                            {['Tecnología', 'Salud', 'Finanzas', 'Construcción', 'Comercio', 'Supermercados', 'Restaurantes', 'Firma de Abogados', 'Educación', 'Otro'].map(sector => {
                              const isSelected = selectedSectors.includes(sector) || (sector === 'Otro' && isOtherSector);
                              return (
                                <TouchableOpacity 
                                  key={sector}
                                  style={[styles.sectorTag, isSelected && styles.sectorTagActive]}
                                  onPress={() => {
                                    if (sector === 'Otro') {
                                      setIsOtherSector(true);
                                      setSelectedSectors([]);
                                    } else {
                                      setIsOtherSector(false);
                                      setSelectedSectors([sector]);
                                    }
                                  }}
                                >
                                  <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>{sector}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>

                          {isOtherSector && (
                            <View style={{ marginTop: 20 }}>
                               <CustomInput placeholder="Escribe tu sector" value={customSector} onChangeText={setCustomSector} iconName="pencil" />
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </>
                )}`;
  content = pre + newSteps + post;
}

const additionalStyles = `  socialBtn: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  socialText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: COLORS.textSecondary, paddingHorizontal: 10, fontSize: 12 },
  areaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  areaCardActive: { borderColor: COLORS.company, backgroundColor: 'rgba(255,0,92,0.1)' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.textSecondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.company },
  areaText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  areaTextActive: { color: 'white', fontWeight: '800' },
});`;

content = content.replace('});', additionalStyles);

fs.writeFileSync('c:/Trabajos/Aptly/screens/RegisterScreen.tsx', content);
console.log('Success');
