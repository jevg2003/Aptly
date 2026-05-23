import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomInput } from '../../../../components/CustomInput';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { COUNTRIES } from '../../../../lib/countries';
import { COLORS } from '../constants';
import { styles } from '../styles';

interface CompanyStepsProps {
  companyStep: number;
  email: string;
  setEmail: (val: string) => void;
  password: React.ComponentProps<typeof CustomInput>['value']; // String
  setPassword: (val: string) => void;
  confirmPassword: React.ComponentProps<typeof CustomInput>['value']; // String
  setConfirmPassword: (val: string) => void;
  companyName: string;
  setCompanyName: (val: string) => void;
  avatarUrl: string | null;
  pickImage: () => void;
  companyWebsite: string;
  setCompanyWebsite: (val: string) => void;
  companyPhone: string;
  setCompanyPhone: (val: string) => void;
  selectedCompanyCountry: string;
  setSelectedCompanyCountry: (val: string) => void;
  selectedCompanyCity: string;
  setSelectedCompanyCity: (val: string) => void;
  companyLocation: string;
  setCompanyLocation: (val: string) => void;
  taxId: string;
  setTaxId: (val: string) => void;
  creationDate: string;
  businessArea: string;
  setBusinessArea: (val: string) => void;
  selectedSectors: string[];
  setSelectedSectors: (val: string[] | ((prev: string[]) => string[])) => void;
  isOtherSector: boolean;
  setIsOtherSector: (val: boolean) => void;
  customSector: string;
  setCustomSector: (val: string) => void;
  selectedTags: string[];
  setSelectedTags: (val: string[] | ((prev: string[]) => string[])) => void;
  customTagInput: string;
  setCustomTagInput: (val: string) => void;
  customTags: string[];
  setCustomTags: (val: string[] | ((prev: string[]) => string[])) => void;
  companyCulture: string;
  setCompanyCulture: (val: string) => void;
  pdfName: string | null;
  pickDocument: () => void;
  setCompanyStep: (val: number) => void;
  showAlert: (msg: string) => void;

  // New properties
  creationYear: string;
  setCreationYear: (val: string) => void;
  creationMonth: string;
  setCreationMonth: (val: string) => void;
  creationDay: string;
  setCreationDay: (val: string) => void;
  getDaysInMonth: (month: string, year: string) => string[];
  getCompanyIdLabel: (country: string) => string;
  sectorsList: string[];
}

const TAG_CATEGORIES = {
  Modalidad: ['Remoto', 'Híbrido', 'Presencial', 'Horario Flexible'],
  Horarios: ['Tiempo Completo', 'Medio Tiempo', 'Fines de Semana'],
  Beneficios: ['Seguro Médico', 'Bonos', 'Crecimiento', 'Snacks', 'Gimnasio'],
  Valores: ['Innovación', 'Diversidad', 'Sostenibilidad', 'Trabajo en Equipo'],
  Tamaño: ['Startup', 'Pequeña (1-50)', 'Mediana (51-200)', 'Corporativo (200+)'],
};

export const CompanySteps = ({
  companyStep,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  companyName,
  setCompanyName,
  avatarUrl,
  pickImage,
  companyWebsite,
  setCompanyWebsite,
  companyPhone,
  setCompanyPhone,
  selectedCompanyCountry,
  setSelectedCompanyCountry,
  selectedCompanyCity,
  setSelectedCompanyCity,
  companyLocation,
  setCompanyLocation,
  taxId,
  setTaxId,
  creationDate,
  businessArea,
  setBusinessArea,
  selectedSectors,
  setSelectedSectors,
  isOtherSector,
  setIsOtherSector,
  customSector,
  setCustomSector,
  selectedTags,
  setSelectedTags,
  customTagInput,
  setCustomTagInput,
  customTags,
  setCustomTags,
  companyCulture,
  setCompanyCulture,
  pdfName,
  pickDocument,
  setCompanyStep,
  showAlert,
  creationYear,
  setCreationYear,
  creationMonth,
  setCreationMonth,
  creationDay,
  setCreationDay,
  getDaysInMonth,
  getCompanyIdLabel,
  sectorsList,
}: CompanyStepsProps) => {
  return (
    <>
      {companyStep === 1 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Crea tu cuenta empresarial</Text>
          <Text style={styles.questionSubtitle}>Ingresa con tu correo u opciones sociales.</Text>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => showAlert('Autenticación con Google próximamente')}>
              <Image
                source={{
                  uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png',
                }}
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => showAlert('Autenticación con GitHub próximamente')}>
              <MaterialCommunityIcons name="github" size={20} color="white" />
              <Text style={styles.socialText}>GitHub</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o con tu correo electrónico</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomInput
            placeholder="Correo institucional"
            value={email}
            onChangeText={setEmail}
            iconName="email-outline"
            role="company"
          />
        </View>
      )}

      {companyStep === 2 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Seguridad de la cuenta</Text>
          <Text style={styles.questionSubtitle}>Crea una contraseña segura para tu empresa.</Text>
          <CustomInput
            placeholder="Contraseña segura"
            value={password}
            onChangeText={setPassword}
            iconName="lock-outline"
            isPassword
            role="company"
          />
          {password.length > 0 && password.length < 6 && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: -15,
                marginBottom: 15,
                marginLeft: 5,
              }}>
              La contraseña debe tener al menos 6 caracteres.
            </Text>
          )}
          <CustomInput
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            iconName="lock-check-outline"
            isPassword
            role="company"
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text
              style={{
                color: '#ef4444',
                fontSize: 12,
                marginTop: -15,
                marginBottom: 15,
                marginLeft: 5,
              }}>
              Las contraseñas no coinciden.
            </Text>
          )}
        </View>
      )}

      {companyStep === 3 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>
            ¡Hagamos crecer tu equipo! ¿Cuál es el nombre de tu empresa?
          </Text>

          <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 20 }}>
            <TouchableOpacity
              onPress={pickImage}
              style={[
                styles.avatarPicker,
                { borderColor: COLORS.company, backgroundColor: 'rgba(255,0,92,0.05)' },
              ]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={32} color={COLORS.company} />
                  <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>
                    Logo empresa
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <CustomInput
            placeholder="Nombre de la empresa / Razón Social"
            value={companyName}
            onChangeText={setCompanyName}
            iconName="office-building"
            role="company"
          />

          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: 13,
              marginTop: 16,
              marginBottom: 8,
              fontWeight: '600',
            }}>
            Datos opcionales (puedes completarlos después):
          </Text>

          <CustomInput
            placeholder="Sitio web (https://tuempresa.com)"
            value={companyWebsite}
            onChangeText={setCompanyWebsite}
            iconName="earth"
            role="company"
          />
          <SearchableSelect
            placeholder="Selecciona el País de la empresa"
            value={selectedCompanyCountry}
            onSelect={(country) => {
              setSelectedCompanyCountry(country);
              setSelectedCompanyCity('');
              setCompanyLocation('');
            }}
            options={COUNTRIES.map((c) => ({ name: c.name, flag: c.flag }))}
            iconName="earth"
            role="company"
          />

          <SearchableSelect
            placeholder="Selecciona la Ciudad de la empresa"
            value={selectedCompanyCity}
            onSelect={(city) => {
              setSelectedCompanyCity(city);
              setCompanyLocation(`${city}, ${selectedCompanyCountry}`);
            }}
            options={
              selectedCompanyCountry
                ? COUNTRIES.find((c) => c.name === selectedCompanyCountry)?.cities || []
                : []
            }
            iconName="city"
            disabled={!selectedCompanyCountry}
            role="company"
          />
          <CustomInput
            placeholder="Teléfono de contacto"
            value={companyPhone}
            onChangeText={setCompanyPhone}
            iconName="phone-outline"
            role="company"
          />
        </View>
      )}

      {companyStep === 4 &&
        (() => {
          const currentYear = new Date().getFullYear();
          const years = Array.from({ length: currentYear - 1800 + 1 }, (_, i) =>
            (currentYear - i).toString()
          );
          const months = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre',
          ];
          const days = creationMonth ? getDaysInMonth(creationMonth, creationYear) : [];

          return (
            <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
              <Text style={styles.questionTitle}>Identidad corporativa</Text>
              <Text style={styles.questionSubtitle}>
                Ingresa el ID fiscal y la fecha en que se fundó la empresa.
              </Text>

              <CustomInput
                placeholder={getCompanyIdLabel(selectedCompanyCountry)}
                value={taxId}
                onChangeText={setTaxId}
                iconName="card-account-details-outline"
                role="company"
              />

              <Text style={[styles.sectorsLabel, { marginTop: 15, marginBottom: 8 }]}>
                Fecha de Creación / Fundación:
              </Text>

              <View style={{ flexDirection: 'row', gap: 6, width: '100%' }}>
                <SearchableSelect
                  placeholder="Año"
                  value={creationYear}
                  onSelect={(val) => {
                    setCreationYear(val);
                    setCreationDay('');
                  }}
                  options={years}
                  containerStyle={{ flex: 1 }}
                  role="company"
                  compact
                  hideIcon
                />

                <SearchableSelect
                  placeholder="Mes"
                  value={creationMonth}
                  onSelect={(val) => {
                    setCreationMonth(val);
                    setCreationDay('');
                  }}
                  options={months}
                  containerStyle={{ flex: 1.3 }}
                  role="company"
                  disabled={!creationYear}
                  compact
                  hideIcon
                />

                <SearchableSelect
                  placeholder="Día"
                  value={creationDay}
                  onSelect={setCreationDay}
                  options={days}
                  containerStyle={{ flex: 0.9 }}
                  role="company"
                  disabled={!creationMonth}
                  compact
                  hideIcon
                />
              </View>

              {creationDate ? (
                <View
                  style={{
                    marginTop: 24,
                    padding: 16,
                    backgroundColor: 'rgba(255,0,92,0.03)',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255,0,92,0.1)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={20}
                    color={COLORS.company}
                  />
                  <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>
                    Fecha seleccionada: {creationDate}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })()}

      {companyStep === 5 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>¿En qué área opera la empresa?</Text>
          <Text style={styles.questionSubtitle}>Selecciona el área principal de negocio.</Text>
          <View style={{ gap: 12, marginTop: 10 }}>
            {['Industrial', 'Servicio', 'Comercial'].map((area) => (
              <TouchableOpacity
                key={area}
                style={[styles.areaCard, businessArea === area && styles.areaCardActive]}
                onPress={() => setBusinessArea(area)}>
                <View style={styles.radioCircle}>
                  {businessArea === area && <View style={styles.radioInner} />}
                </View>
                <Text style={[styles.areaText, businessArea === area && styles.areaTextActive]}>
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {companyStep === 6 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>¿Qué sector destaca más?</Text>
          <Text style={styles.questionSubtitle}>
            Elige un sector o añade el tuyo. Se sincronizan globalmente con candidatos.
          </Text>
          <View style={styles.sectorsContainer}>
            <View style={styles.sectorsGrid}>
              {sectorsList.map((sector) => {
                const isSelected =
                  selectedSectors.includes(sector) || (sector === 'Otro' && isOtherSector);
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
                    }}>
                    <Text style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>
                      {sector}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {isOtherSector && (
              <View style={{ marginTop: 20 }}>
                <CustomInput
                  placeholder="Escribe tu sector"
                  value={customSector}
                  onChangeText={setCustomSector}
                  iconName="pencil"
                  role="company"
                />
              </View>
            )}
          </View>
        </View>
      )}

      {companyStep === 7 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Etiquetas de la Empresa</Text>
          <Text style={styles.questionSubtitle}>
            Selecciona las características que mejor describen a tu empresa para atraer a los
            candidatos ideales.
          </Text>

          {Object.entries(TAG_CATEGORIES).map(([category, tags]) => (
            <View key={category} style={{ marginBottom: 20 }}>
              <Text style={styles.sectorsLabel}>{category}</Text>
              <View style={styles.sectorsGrid}>
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.sectorTag, isSelected && styles.sectorTagActive]}
                      onPress={() => {
                        if (isSelected) setSelectedTags((prev) => prev.filter((t) => t !== tag));
                        else setSelectedTags((prev) => [...prev, tag]);
                      }}>
                      <Text
                        style={[styles.sectorTagText, isSelected && styles.sectorTagTextActive]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <View
            style={{
              marginTop: 10,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              paddingTop: 20,
            }}>
            <Text style={styles.sectorsLabel}>¿No encontraste lo que buscabas? Créalo:</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  placeholder="Escribe tu etiqueta"
                  value={customTagInput}
                  onChangeText={setCustomTagInput}
                  iconName="tag-plus-outline"
                  role="company"
                />
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.company,
                  height: 50,
                  width: 50,
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -15,
                }}
                onPress={() => {
                  if (customTagInput.trim() && !customTags.includes(customTagInput.trim())) {
                    setCustomTags((prev) => [...prev, customTagInput.trim()]);
                    setCustomTagInput('');
                  }
                }}>
                <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {customTags.length > 0 && (
              <View style={[styles.sectorsGrid, { marginTop: 10 }]}>
                {customTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.sectorTag, styles.sectorTagActive]}
                    onPress={() => setCustomTags((prev) => prev.filter((t) => t !== tag))}>
                    <Text style={styles.sectorTagTextActive}>{tag} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {companyStep === 8 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Cultura y Valores de la Empresa</Text>
          <Text style={styles.questionSubtitle}>
            Opcional – Cuente a los candidatos qué hace especial a tu empresa. Puedes omitir este
            paso.
          </Text>

          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: 'rgba(255,0,92,0.2)',
              borderRadius: 20,
              padding: 16,
              minHeight: 160,
              marginBottom: 20,
            }}>
            <TextInput
              multiline
              numberOfLines={7}
              style={{ color: '#FFF', fontSize: 15, lineHeight: 24, textAlignVertical: 'top' }}
              value={companyCulture}
              onChangeText={setCompanyCulture}
              placeholder="Ej. Somos una empresa ágil que apuesta por la innovación y el bienestar de nuestro equipo..."
              placeholderTextColor="#475569"
            />
          </View>

          <TouchableOpacity
            onPress={() => setCompanyStep(9)}
            style={{
              alignSelf: 'center',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}>
            <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>
              Omitir este paso
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {companyStep === 9 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Información de Contacto</Text>
          <Text style={styles.questionSubtitle}>
            El teléfono de contacto es obligatorio para que los candidatos puedan comunicarse con tu
            empresa.
          </Text>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.sectorsLabel}>Sitio Web (Opcional)</Text>
              <CustomInput
                placeholder="https://tuempresa.com"
                value={companyWebsite}
                onChangeText={setCompanyWebsite}
                iconName="earth"
                role="company"
              />
            </View>

            <View>
              <Text style={styles.sectorsLabel}>Teléfono de Contacto (Obligatorio)</Text>
              <CustomInput
                placeholder="+57 300 000 0000"
                value={companyPhone}
                onChangeText={setCompanyPhone}
                iconName="phone-outline"
                role="company"
              />
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.sectorsLabel}>Ubicación Principal (Opcional)</Text>
              <SearchableSelect
                placeholder="Selecciona el País de la empresa"
                value={selectedCompanyCountry}
                onSelect={(country) => {
                  setSelectedCompanyCountry(country);
                  setSelectedCompanyCity('');
                  setCompanyLocation('');
                }}
                options={COUNTRIES.map((c) => ({ name: c.name, flag: c.flag }))}
                iconName="earth"
                role="company"
              />

              <SearchableSelect
                placeholder="Selecciona la Ciudad de la empresa"
                value={selectedCompanyCity}
                onSelect={(city) => {
                  setSelectedCompanyCity(city);
                  setCompanyLocation(`${city}, ${selectedCompanyCountry}`);
                }}
                options={
                  selectedCompanyCountry
                    ? COUNTRIES.find((c) => c.name === selectedCompanyCountry)?.cities || []
                    : []
                }
                iconName="city"
                disabled={!selectedCompanyCountry}
                role="company"
              />
            </View>
          </View>
        </View>
      )}

      {companyStep === 10 && (
        <View style={[styles.stepContainer, { justifyContent: 'flex-start' }]}>
          <Text style={styles.questionTitle}>Vista Previa del Perfil</Text>
          <Text style={styles.questionSubtitle}>Así es como los candidatos verán tu empresa.</Text>

          <View style={styles.previewCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: 60, height: 60, borderRadius: 30, marginRight: 16 }}
                />
              ) : (
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: 'rgba(255,0,92,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}>
                  <MaterialCommunityIcons name="domain" size={30} color={COLORS.company} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold' }} numberOfLines={1}>
                  {companyName || 'Nombre Empresa'}
                </Text>
                <Text style={{ color: COLORS.textSecondary }} numberOfLines={1}>
                  {isOtherSector ? customSector : selectedSectors[0] || 'Sector'} •{' '}
                  {businessArea || 'Área'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <View>
                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 10,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                  }}>
                  NIT
                </Text>
                <Text style={{ color: '#FFF', fontSize: 13 }}>{taxId}</Text>
              </View>
              {companyLocation ? (
                <View>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 10,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                    }}>
                    Ubicación
                  </Text>
                  <Text style={{ color: '#FFF', fontSize: 13 }}>{companyLocation}</Text>
                </View>
              ) : null}
              {companyPhone ? (
                <View>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: 10,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                    }}>
                    Teléfono
                  </Text>
                  <Text style={{ color: '#FFF', fontSize: 13 }}>{companyPhone}</Text>
                </View>
              ) : null}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  color: COLORS.textSecondary,
                  fontSize: 10,
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                Etiquetas Seleccionadas
              </Text>
              <View style={styles.sectorsGrid}>
                {[...selectedTags, ...customTags].length > 0 ? (
                  [...selectedTags, ...customTags].map((tag) => (
                    <View
                      key={tag}
                      style={[
                        styles.sectorTag,
                        {
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderColor: 'rgba(255,255,255,0.1)',
                        },
                      ]}>
                      <Text style={{ color: '#FFF', fontSize: 11 }}>{tag}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: COLORS.textSecondary, fontSize: 12, fontStyle: 'italic' }}>
                    Sin etiquetas aún
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Text style={[styles.questionSubtitle, { marginTop: 24, marginBottom: 12 }]}>
            Añadir más información (Opcional)
          </Text>
          <TouchableOpacity style={styles.pdfButton} onPress={pickDocument}>
            <MaterialCommunityIcons
              name={pdfName ? 'file-pdf-box' : 'file-upload-outline'}
              size={24}
              color={pdfName ? COLORS.company : COLORS.textSecondary}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: pdfName ? '#FFF' : COLORS.textSecondary, fontWeight: 'bold' }}>
                {pdfName ? pdfName : 'Subir presentación o brochure (PDF)'}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>
                {pdfName ? 'Toca para cambiar el archivo' : 'Los candidatos podrán descargarlo'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {companyStep === 11 && (
        <View style={[styles.stepContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,0,92,0.1)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 32,
            }}>
            <MaterialCommunityIcons name="rocket-launch" size={60} color={COLORS.company} />
          </View>
          <Text style={[styles.questionTitle, { textAlign: 'center' }]}>¡Todo listo!</Text>
          <Text
            style={[
              styles.questionSubtitle,
              { textAlign: 'center', fontSize: 16, lineHeight: 24 },
            ]}>
            Tu perfil de empresa ha sido preparado exitosamente.
          </Text>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
              marginTop: 10,
            }}>
            <Text style={{ color: '#FFF', textAlign: 'center', lineHeight: 22 }}>
              Para comenzar a conocer a los candidatos ideales, tu primer paso será presionar el
              botón <Text style={{ fontWeight: 'bold', color: COLORS.company }}>+</Text> en la parte
              inferior de tu pantalla principal para crear un puesto vacante.
            </Text>
          </View>
        </View>
      )}
    </>
  );
};
