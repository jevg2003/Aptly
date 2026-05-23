import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomInput } from '../../../../components/CustomInput';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { COUNTRIES } from '../../../../lib/countries';
import { PROFESSIONS } from '../../../../lib/professions';
import { COLORS } from '../constants';
import { styles } from '../styles';

interface CandidateStepsProps {
  candidateStep: number;
  email: string;
  setEmail: (val: string) => void;
  password: React.ComponentProps<typeof CustomInput>['value']; // String
  setPassword: (val: string) => void;
  confirmPassword: React.ComponentProps<typeof CustomInput>['value']; // String
  setConfirmPassword: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  avatarUrl: string | null;
  pickImage: () => void;
  selectedCountry: string;
  setSelectedCountry: (val: string) => void;
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  candidateLocation: string;
  setCandidateLocation: (val: string) => void;
  birthDate: string;
  profession: string;
  setProfession: (val: string) => void;
  experienceLevel: string;
  setExperienceLevel: (val: string) => void;
  aiAssessed: boolean;
  setAiAssessed: (val: boolean) => void;
  showManualLevel: boolean;
  setShowManualLevel: (val: boolean) => void;
  assessmentResult: { score: number; tier: string; feedback: string } | null;
  setShowAiAssessment: (val: boolean) => void;
  setCandidateStep: (val: number) => void;
  candidateSectors: string[];
  setCandidateSectors: (val: string[] | ((prev: string[]) => string[])) => void;
  customCandidateTagInput: string;
  setCustomCandidateTagInput: (val: string) => void;
  customCandidateTags: string[];
  setCustomCandidateTags: (val: string[] | ((prev: string[]) => string[])) => void;
  candidateBio: string;
  setCandidateBio: (val: string) => void;
  candidatePhone: string;
  setCandidatePhone: (val: string) => void;
  candidateLinkedIn: string;
  setCandidateLinkedIn: (val: string) => void;
  candidatePortfolio: string;
  setCandidatePortfolio: (val: string) => void;
  pdfName: string | null;
  pickDocument: () => void;
  showAlert: (msg: string) => void;

  // New properties
  nationalId: string;
  setNationalId: (val: string) => void;
  getNationalIdLabel: (country: string) => string;
  birthYear: string;
  setBirthYear: (val: string) => void;
  birthMonth: string;
  setBirthMonth: (val: string) => void;
  birthDay: string;
  setBirthDay: (val: string) => void;
  getDaysInMonth: (month: string, year: string) => string[];
  sectorsList: string[];
  customSector: string;
  setCustomSector: (val: string) => void;
  candidateTagsByCategory: Record<string, string[]>;
  addCustomCandidateTag: () => void;
}

const SECTORS = [
  'Tecnología', 'Salud', 'Finanzas', 'Construcción', 'Comercio',
  'Manufactura', 'Servicios', 'Marketing', 'Educación', 'Otro'
];

export const CandidateSteps = ({
  candidateStep,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  fullName,
  setFullName,
  avatarUrl,
  pickImage,
  selectedCountry,
  setSelectedCountry,
  selectedCity,
  setSelectedCity,
  candidateLocation,
  setCandidateLocation,
  birthDate,
  profession,
  setProfession,
  experienceLevel,
  setExperienceLevel,
  aiAssessed,
  setAiAssessed,
  showManualLevel,
  setShowManualLevel,
  assessmentResult,
  setShowAiAssessment,
  setCandidateStep,
  candidateSectors,
  setCandidateSectors,
  customCandidateTagInput,
  setCustomCandidateTagInput,
  customCandidateTags,
  setCustomCandidateTags,
  candidateBio,
  setCandidateBio,
  candidatePhone,
  setCandidatePhone,
  candidateLinkedIn,
  setCandidateLinkedIn,
  candidatePortfolio,
  setCandidatePortfolio,
  pdfName,
  pickDocument,
  showAlert,
  nationalId,
  setNationalId,
  getNationalIdLabel,
  birthYear,
  setBirthYear,
  birthMonth,
  setBirthMonth,
  birthDay,
  setBirthDay,
  getDaysInMonth,
  sectorsList,
  customSector,
  setCustomSector,
  candidateTagsByCategory,
  addCustomCandidateTag
}: CandidateStepsProps) => {
  return (
    <>
      {candidateStep === 1 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Crea tu cuenta de candidato</Text>
          <Text style={styles.questionSubtitle}>Ingresa con tu correo u opciones sociales.</Text>
          
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
             <TouchableOpacity style={styles.socialBtn} onPress={() => showAlert('Autenticación con Google próximamente')}>
                <Image source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }} style={{ width: 18, height: 18, marginRight: 8 }} />
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

          <CustomInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} iconName="email-outline" role="candidate" />
        </View>
      )}

      {candidateStep === 2 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Seguridad de la cuenta</Text>
          <Text style={styles.questionSubtitle}>Crea una contraseña segura para tu perfil.</Text>
          <CustomInput placeholder="Contraseña segura" value={password} onChangeText={setPassword} iconName="lock-outline" isPassword role="candidate" />
          {password.length > 0 && password.length < 6 && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 5 }}>La contraseña debe tener al menos 6 caracteres.</Text>
          )}
          <CustomInput placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} iconName="lock-check-outline" isPassword role="candidate" />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 5 }}>Las contraseñas no coinciden.</Text>
          )}
        </View>
      )}

      {candidateStep === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.questionTitle}>Datos de Identificación</Text>
          <Text style={styles.questionSubtitle}>Selecciona tu ubicación e ingresa tu información personal.</Text>
          
          <SearchableSelect
            placeholder="Selecciona tu País"
            value={selectedCountry}
            onSelect={(country) => {
              setSelectedCountry(country);
              setSelectedCity('');
              setCandidateLocation('');
              setNationalId('');
            }}
            options={COUNTRIES.map(c => ({ name: c.name, flag: c.flag }))}
            iconName="earth"
            role="candidate"
          />

          <SearchableSelect
            placeholder="Selecciona tu Ciudad"
            value={selectedCity}
            onSelect={(city) => {
              setSelectedCity(city);
              setCandidateLocation(`${city}, ${selectedCountry}`);
            }}
            options={selectedCountry ? COUNTRIES.find(c => c.name === selectedCountry)?.cities || [] : []}
            iconName="city"
            disabled={!selectedCountry}
            role="candidate"
          />

          <CustomInput 
            placeholder="Nombre y Apellidos Completos" 
            value={fullName} 
            onChangeText={setFullName} 
            iconName="account-outline" 
            role="candidate" 
          />

          <CustomInput 
            placeholder={selectedCountry ? getNationalIdLabel(selectedCountry) : 'Selecciona tu país primero'} 
            value={nationalId} 
            onChangeText={setNationalId} 
            iconName="card-account-details-outline" 
            role="candidate"
            editable={!!selectedCountry}
          />

          <View style={{ alignItems: 'center', marginBottom: 10, marginTop: 15 }}>
            <TouchableOpacity onPress={pickImage} style={[styles.avatarPicker, { borderColor: COLORS.candidate, backgroundColor: 'rgba(0,163,255,0.05)' }]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.candidate} />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>Tu foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {candidateStep === 4 && (() => {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => (currentYear - i).toString());
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const days = birthMonth ? getDaysInMonth(birthMonth, birthYear) : [];

        return (
          <View style={styles.stepContainer}>
            <Text style={styles.questionTitle}>Fecha de Nacimiento</Text>
            <Text style={styles.questionSubtitle}>Por favor ingresa tu fecha de nacimiento usando los selectores horizontales (Año, Mes, Día).</Text>
            
            <View style={{ flexDirection: 'row', gap: 6, width: '100%', marginTop: 20 }}>
              <SearchableSelect
                placeholder="Año"
                value={birthYear}
                onSelect={(val) => {
                  setBirthYear(val);
                  setBirthDay('');
                }}
                options={years}
                containerStyle={{ flex: 1 }}
                role="candidate"
                compact
                hideIcon
              />

              <SearchableSelect
                placeholder="Mes"
                value={birthMonth}
                onSelect={(val) => {
                  setBirthMonth(val);
                  setBirthDay('');
                }}
                options={months}
                containerStyle={{ flex: 1.3 }}
                role="candidate"
                disabled={!birthYear}
                compact
                hideIcon
              />

              <SearchableSelect
                placeholder="Día"
                value={birthDay}
                onSelect={setBirthDay}
                options={days}
                containerStyle={{ flex: 0.9 }}
                role="candidate"
                disabled={!birthMonth}
                compact
                hideIcon
              />
            </View>
            
            {birthDate ? (
              <View style={{ marginTop: 24, padding: 16, backgroundColor: 'rgba(0,163,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,163,255,0.1)', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="check-circle-outline" size={20} color={COLORS.candidate} />
                <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>
                  Fecha seleccionada: {birthDate}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })()}

      {candidateStep === 5 && (
        <View style={styles.stepContainer}>
          <Text style={styles.questionTitle}>Perfil Profesional</Text>
          <Text style={styles.questionSubtitle}>¿A qué te dedicas y cuál es tu nivel?</Text>
          <SearchableSelect
            placeholder="Profesión u Ocupación Principal"
            value={profession}
            onSelect={(p) => {
              setProfession(p);
              setAiAssessed(false);
              setExperienceLevel('');
            }}
            options={PROFESSIONS.map(p => ({ name: p.name, subtext: p.category }))}
            iconName="briefcase-outline"
            role="candidate"
          />
          
          {!profession ? (
            <View style={styles.professionSelectPrompt}>
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#64748b" />
              <Text style={styles.professionSelectPromptText}>
                Selecciona tu profesión arriba para certificar tu nivel con IA o elegirlo manualmente.
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 15, gap: 15 }}>
              {aiAssessed ? (
                /* Glowing Certified Neon Card */
                <View style={styles.glowingCertCard}>
                  <View style={styles.glowingCertHeader}>
                    <MaterialCommunityIcons name="check-decagram" size={24} color={COLORS.candidate} />
                    <Text style={styles.glowingCertTitle}>PERFIL CERTIFICADO POR IA</Text>
                  </View>
                  
                  <Text style={styles.glowingCertLevel}>{experienceLevel}</Text>
                  
                  {assessmentResult && (
                    <View style={styles.glowingCertFeedbackBox}>
                      <Text style={styles.glowingCertFeedbackLabel}>REPORTE COGNITIVO:</Text>
                      <Text style={styles.glowingCertFeedbackText}>
                        {assessmentResult.feedback}
                      </Text>
                    </View>
                  )}

                  <View style={styles.glowingCertActions}>
                    <TouchableOpacity 
                      style={styles.glowingCertBtn}
                      onPress={() => {
                        setShowAiAssessment(true);
                      }}
                    >
                      <MaterialCommunityIcons name="cached" size={16} color={COLORS.candidate} />
                      <Text style={styles.glowingCertBtnText}>Re-evaluar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.glowingCertBtnSec}
                      onPress={() => {
                        setAiAssessed(false);
                        setShowManualLevel(true);
                        setExperienceLevel('');
                      }}
                    >
                      <Text style={styles.glowingCertBtnSecText}>Elegir Manual</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : showManualLevel ? (
                /* Manual Selection List */
                <View style={{ gap: 12 }}>
                  {['Junior', 'Mid-Level', 'Senior', 'Lead/Manager'].map(lvl => (
                    <TouchableOpacity 
                       key={lvl}
                       style={[styles.areaCard, experienceLevel === lvl && styles.areaCardCandidateActive]}
                       onPress={() => setExperienceLevel(lvl)}
                    >
                       <View style={[styles.radioCircle, { borderColor: experienceLevel === lvl ? COLORS.candidate : COLORS.textSecondary }]}>
                          {experienceLevel === lvl && <View style={[styles.radioInner, { backgroundColor: COLORS.candidate }]} />}
                       </View>
                       <Text style={[styles.areaText, experienceLevel === lvl && { color: COLORS.candidate }]}>{lvl}</Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity 
                    onPress={() => setShowManualLevel(false)}
                    style={styles.backToAiBtn}
                  >
                    <MaterialCommunityIcons name="brain" size={16} color={COLORS.candidate} style={{ marginRight: 6 }} />
                    <Text style={styles.backToAiBtnText}>✨ Certificar mi nivel con IA</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* AI Assessment Glassmorphic Promo Card */
                <View style={styles.aiPromoCard}>
                  <View style={styles.aiPromoHeader}>
                    <View style={styles.aiPromoBrainIconBg}>
                      <MaterialCommunityIcons name="brain" size={24} color={COLORS.candidate} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.aiPromoTitle}>Evaluador de Nivel con IA</Text>
                      <Text style={styles.aiPromoSubtitle}>Acredita tu experiencia en segundos</Text>
                    </View>
                  </View>

                  <Text style={styles.aiPromoDesc}>
                    Resuelve 3 preguntas técnicas y de escenarios clave personalizadas para <Text style={{ fontWeight: 'bold', color: '#FFF' }}>{profession}</Text> para obtener tu certificado de competencias neón visible para reclutadores.
                  </Text>

                  <TouchableOpacity 
                    style={styles.aiPromoBtn}
                    onPress={() => {
                      setShowAiAssessment(true);
                    }}
                  >
                    <Text style={styles.aiPromoBtnText}>✨ Certificar Nivel con IA</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setShowManualLevel(true)}
                    style={styles.aiPromoManualBtn}
                  >
                    <Text style={styles.aiPromoManualBtnText}>Seleccionar nivel manualmente</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {candidateStep === 6 && (
        <View style={styles.stepContainer}>
          <Text style={styles.questionTitle}>¿Qué sectores te interesan?</Text>
          <Text style={styles.questionSubtitle}>Selecciona las industrias en las que te gustaría trabajar. Los sectores se sincronizan globalmente.</Text>
          <View style={styles.sectorsContainer}>
            <View style={styles.sectorsGrid}>
              {sectorsList.map(sector => {
                const isSelected = candidateSectors.includes(sector);
                return (
                  <TouchableOpacity 
                    key={sector}
                    style={[styles.sectorTag, isSelected && styles.sectorTagCandidateActive]}
                    onPress={() => {
                      if (sector === 'Otro') {
                        if (isSelected) setCandidateSectors(prev => prev.filter(s => s !== 'Otro'));
                        else setCandidateSectors(prev => [...prev, 'Otro']);
                      } else {
                        if (isSelected) setCandidateSectors(prev => prev.filter(s => s !== sector));
                        else setCandidateSectors(prev => [...prev, sector]);
                      }
                    }}
                  >
                    <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>{sector}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {candidateSectors.includes('Otro') && (
              <View style={{ marginTop: 20 }}>
                <CustomInput 
                  placeholder="Escribe tu sector de interés" 
                  value={customSector} 
                  onChangeText={setCustomSector} 
                  iconName="pencil" 
                  role="candidate" 
                />
              </View>
            )}
          </View>
        </View>
      )}

      {candidateStep === 7 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Tus Habilidades y Aptitudes</Text>
          <Text style={styles.questionSubtitle}>Selecciona habilidades de las categorías o añade las tuyas. Se sincronizarán automáticamente.</Text>
          
          <ScrollView style={{ flex: 1, maxHeight: 320 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {Object.entries(candidateTagsByCategory).map(([category, tags]) => {
              if (category === 'Recomendadas por IA' && tags.length === 0) return null;
              
              return (
                <View key={category} style={{ marginBottom: 20 }}>
                  <Text style={styles.sectorsLabel}>
                    {category === 'Recomendadas por IA' ? '✨ ' + category : category}
                  </Text>
                  <View style={styles.sectorsGrid}>
                    {tags.map(tag => {
                      const isSelected = customCandidateTags.includes(tag);
                      return (
                        <TouchableOpacity 
                          key={tag}
                          style={[
                            styles.sectorTag, 
                            isSelected && styles.sectorTagCandidateActive,
                            category === 'Recomendadas por IA' && isSelected && { borderColor: COLORS.candidate }
                          ]}
                          onPress={() => {
                            if (isSelected) setCustomCandidateTags(prev => prev.filter(t => t !== tag));
                            else setCustomCandidateTags(prev => [...prev, tag]);
                          }}
                        >
                          <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>
                            {category === 'Recomendadas por IA' ? '✨ ' + tag : tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15 }}>
            <Text style={styles.sectorsLabel}>¿Habilidad personalizada? Agrégala para uso común:</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <CustomInput 
                  placeholder="Ej. React, Liderazgo, Francés..." 
                  value={customCandidateTagInput} 
                  onChangeText={setCustomCandidateTagInput} 
                  iconName="tag-plus-outline" 
                  role="candidate"
                />
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: COLORS.candidate, height: 50, width: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: -15 }}
                onPress={addCustomCandidateTag}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {candidateStep === 8 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Enlaces y Contacto</Text>
          <Text style={styles.questionSubtitle}>El número celular es obligatorio para que las empresas puedan contactarte.</Text>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.sectorsLabel}>Celular / Teléfono (Obligatorio)</Text>
              <CustomInput 
                placeholder="+57 300 000 0000" 
                value={candidatePhone} 
                onChangeText={setCandidatePhone} 
                iconName="phone-outline" 
                role="candidate" 
              />
            </View>
            <View>
              <Text style={styles.sectorsLabel}>LinkedIn (Opcional)</Text>
              <CustomInput 
                placeholder="https://linkedin.com/in/tu-perfil" 
                value={candidateLinkedIn} 
                onChangeText={setCandidateLinkedIn} 
                iconName="linkedin" 
                role="candidate" 
              />
            </View>
            <View>
              <Text style={styles.sectorsLabel}>Sitio Web / Portafolio (Opcional)</Text>
              <CustomInput 
                placeholder="https://tu-portafolio.com" 
                value={candidatePortfolio} 
                onChangeText={setCandidatePortfolio} 
                iconName="web" 
                role="candidate" 
              />
            </View>
          </View>
        </View>
      )}

      {candidateStep === 9 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Vista Previa y Currículum</Text>
          <Text style={styles.questionSubtitle}>Así se verá tu perfil principal para las empresas.</Text>
          
          <View style={[styles.previewCard, { borderColor: 'rgba(0,163,255,0.1)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16 }} />
              ) : (
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,163,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <MaterialCommunityIcons name="account" size={30} color={COLORS.candidate} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }} numberOfLines={1}>{fullName || 'Nombre Completo'}</Text>
                <Text style={{ color: COLORS.textSecondary }} numberOfLines={1}>{profession || 'Profesión'} • {experienceLevel || 'Nivel'}</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {candidateLocation ? (
                <View>
                  <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Ubicación</Text>
                  <Text style={{ color: '#FFF', fontSize: 13 }}>{candidateLocation}</Text>
                </View>
              ) : null}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 }}>Habilidades</Text>
              <View style={styles.sectorsGrid}>
                {customCandidateTags.length > 0 ? (
                  customCandidateTags.map(tag => (
                    <View key={tag} style={[styles.sectorTag, { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(0,163,255,0.1)' }]}>
                      <Text style={{ color: '#FFF', fontSize: 11 }}>{tag}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic' }}>Sin habilidades aún</Text>
                )}
              </View>
            </View>

            {candidateSectors && candidateSectors.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 }}>Sectores de Interés</Text>
                <View style={styles.sectorsGrid}>
                  {candidateSectors.map(sector => (
                    <View key={sector} style={[styles.sectorTag, { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
                      <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '600' }}>{sector}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {candidateBio ? (
              <View style={{ marginTop: 12, backgroundColor: 'rgba(0,163,255,0.04)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,163,255,0.1)' }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 }}>Sobre Mí</Text>
                <Text style={{ color: '#FFF', fontSize: 12, lineHeight: 18 }}>{candidateBio}</Text>
              </View>
            ) : null}

            {(candidatePhone || candidateLinkedIn || candidatePortfolio) && (
              <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 8 }}>
                <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 }}>Contacto y Enlaces</Text>
                {candidatePhone ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="phone-outline" size={14} color={COLORS.candidate} />
                    <Text style={{ color: '#FFF', fontSize: 12, marginLeft: 8 }}>{candidatePhone}</Text>
                  </View>
                ) : null}
                {candidateLinkedIn ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="linkedin" size={14} color={COLORS.candidate} />
                    <Text style={{ color: COLORS.candidate, fontSize: 12, marginLeft: 8, textDecorationLine: 'underline' }}>{candidateLinkedIn}</Text>
                  </View>
                ) : null}
                {candidatePortfolio ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="web" size={14} color={COLORS.candidate} />
                    <Text style={{ color: COLORS.candidate, fontSize: 12, marginLeft: 8, textDecorationLine: 'underline' }}>{candidatePortfolio}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          <Text style={[styles.questionSubtitle, { marginTop: 24, marginBottom: 12 }]}>Añadir Currículum (Opcional)</Text>
          <TouchableOpacity style={[styles.pdfButton, { borderColor: pdfName ? COLORS.candidate : COLORS.border }]} onPress={pickDocument}>
            <MaterialCommunityIcons name={pdfName ? "file-pdf-box" : "file-upload-outline"} size={24} color={pdfName ? COLORS.candidate : COLORS.textSecondary} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: pdfName ? '#FFF' : COLORS.textSecondary, fontWeight: 'bold' }}>
                {pdfName ? pdfName : 'Subir tu CV (PDF)'}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                {pdfName ? 'Toca para cambiar el archivo' : 'Las empresas podrán descargarlo'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {candidateStep === 10 && (
        <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,163,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
            <MaterialCommunityIcons name="account-check" size={60} color={COLORS.candidate} />
          </View>
          <Text style={[styles.questionTitle, { textAlign: 'center' }]}>¡Todo listo!</Text>
          <Text style={[styles.questionSubtitle, { textAlign: 'center', fontSize: 16, lineHeight: 24 }]}>
            Tu perfil de candidato ha sido configurado con éxito.
          </Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 10 }}>
            <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 22 }}>
              Al finalizar, se enviará un correo de confirmación y podrás empezar a buscar vacantes que coincidan con tu perfil acreditado por la IA.
            </Text>
          </View>
        </View>
      )}
    </>
  );
};
