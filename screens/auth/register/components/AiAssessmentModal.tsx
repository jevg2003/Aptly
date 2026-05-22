import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Modal,
  StyleSheet
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { getQuestionsForProfession } from '../../../../lib/aiQuestions';
import { COLORS } from '../constants';
import { styles } from '../styles';

interface AiAssessmentModalProps {
  visible: boolean;
  onClose: () => void;
  profession: string;
  onComplete: (tier: string, score: number, feedback: string) => void;
}

export const AiAssessmentModal = ({
  visible,
  onClose,
  profession,
  onComplete
}: AiAssessmentModalProps) => {
  const [assessmentStep, setAssessmentStep] = useState(0); // 0: Welcome, 1-3: Questions, 4: Analyzing, 5: Results
  const [aiAnswers, setAiAnswers] = useState({ ans1: '', ans2: '', ans3: 3 });
  const [analyzingText, setAnalyzingText] = useState('');
  const [assessmentResult, setAssessmentResult] = useState<{ score: number; tier: string; feedback: string } | null>(null);

  // Reanimated shared values
  const orbScale = useSharedValue(1);
  const orbOpacity = useSharedValue(0.6);

  const runGrading = () => {
    const len1 = aiAnswers.ans1.trim().split(/\s+/).filter(Boolean).length;
    const len2 = aiAnswers.ans2.trim().split(/\s+/).filter(Boolean).length;
    const scaleVal = aiAnswers.ans3; // 1-5

    // Average length score
    const avgLen = (len1 + len2) / 2;
    let score = 50; // base score

    if (avgLen > 40) score += 20;
    else if (avgLen > 20) score += 12;
    else if (avgLen > 5) score += 5;

    // Scale score
    score += (scaleVal - 1) * 6; // up to +24

    // Add keyword bonus
    const keywords = [
      'api', 'aws', 'clean', 'patrón', 'diseño', 'arquitectura', 'costo', 'mermas', 'inventario', 'calidad',
      'ley', 'riesgo', 'normativa', 'contrato', 'paciente', 'diagnóstico', 'clínico', 'flujo', 'caja', 'proceso',
      'erp', 'marketing', 'crm', 'cliente', 'pedagogía', 'aprendizaje', 'clase', 'seguridad', 'epp', 'resolución',
      'gestión', 'liderazgo', 'equipo'
    ];
    let bonus = 0;
    const fullText = (aiAnswers.ans1 + ' ' + aiAnswers.ans2).toLowerCase();
    keywords.forEach(word => {
      if (fullText.includes(word)) bonus += 2;
    });
    score += Math.min(bonus, 8); // up to +8

    // Cap score at 98%
    score = Math.min(Math.round(score), 98);

    // Map to tier
    let tier = 'Junior Acreditado';
    if (score >= 85) tier = 'Senior Acreditado';
    else if (score >= 70) tier = 'Mid-Level Acreditado';

    // Tailor strengths feedback
    let feedback = '';
    const qList = getQuestionsForProfession(profession);
    const firstQ = qList[0]?.id || '';

    if (firstQ.startsWith('tech_')) {
      feedback = score >= 80 
        ? 'Demuestra un excelente dominio de patrones de diseño avanzados, optimización de hilo principal y una sólida comprensión de infraestructura en la nube y pipelines de CI/CD.'
        : 'Posee conocimientos sólidos de desarrollo de software, estructurando bien las soluciones básicas. Se beneficiará de profundizar en patrones avanzados y optimización de memoria.';
    } else if (firstQ.startsWith('chef_')) {
      feedback = score >= 80
        ? 'Destaca por su alto rigor conceptual en control de mermas e inventarios y su gran capacidad de liderazgo asertivo y organización bajo situaciones de alta presión en cocina.'
        : 'Muestra buen criterio operativo y manejo básico de recetas y costos. Se aconseja fortalecer el liderazgo de brigadas y planeación avanzada en situaciones imprevistas.';
    } else if (firstQ.startsWith('legal_')) {
      feedback = score >= 80
        ? 'Posee una gran capacidad de análisis de riesgos contractuales y estructuración jurídica persuasiva ante lagunas en jurisprudencia o normativas complejas.'
        : 'Evidencia un correcto dominio de la doctrina jurídica general y contratos estándar. Se recomienda profundizar en argumentación de recursos complejos y litigación avanzada.';
    } else if (firstQ.startsWith('health_')) {
      feedback = score >= 80
        ? 'Refleja una sólida formación en soporte vital avanzado y una excepcional empatía y claridad asertiva al comunicar situaciones clínicas complejas a familiares.'
        : 'Muestra buen manejo de protocolos médicos generales y primeros auxilios. Se aconseja continuar su desarrollo en toma de decisiones críticas bajo escenarios inestables.';
    } else if (firstQ.startsWith('admin_')) {
      feedback = score >= 80
        ? 'Excelente modelado financiero y diseño de flujo de caja proyectado, además de una clara visión metodológica para optimizar procesos administrativos ineficientes.'
        : 'Domina tareas administrativas y contables recurrentes. Se sugiere avanzar en el uso de ERPs de gran escala y formulación de presupuestos a largo plazo.';
    } else if (firstQ.startsWith('sales_')) {
      feedback = score >= 80
        ? 'Gran manejo de embudos de conversión, alta competencia en el uso de herramientas CRM y una excelente metodología estructurada para captación de clientes de alto valor.'
        : 'Muestra facilidad para el cierre de ventas básico y trato al público. Le favorecerá capacitarse en analítica de datos, embudos automatizados e integraciones avanzadas de CRM.';
    } else if (firstQ.startsWith('edu_')) {
      feedback = score >= 80
        ? 'Sobresaliente diseño instruccional, excelente manejo de metodologías inclusivas y adaptabilidad pedagógica activa frente a aulas diversas.'
        : 'Evidencia buenas habilidades de docencia y empatía en el aula. Se recomienda fortalecer el dominio de entornos virtuales de aprendizaje (LMS) y diseño curricular.';
    } else if (firstQ.startsWith('trade_')) {
      feedback = score >= 80
        ? 'Alto compromiso con normativas de seguridad ocupacional y protocolos preventivos, con un enfoque lógico y estructurado para diagnóstico y resolución de fallas técnicas críticas.'
        : 'Muestra buen manejo técnico operativo y destreza en tareas físicas del oficio. Se beneficiará de capacitarse en supervisión de personal e interpretación compleja de planos.';
    } else {
      feedback = score >= 80
        ? 'Demuestra una excelente terminología profesional, sólida metodología en gestión de plazos competitivos bajo presión y gran resolución de conflictos interpersonales.'
        : 'Presenta un perfil balanceado con potencial de crecimiento. Se recomienda enfocar esfuerzos en el desarrollo de liderazgo colaborativo y habilidades blandas bajo estrés.';
    }

    setAssessmentResult({ score, tier, feedback });
    setAssessmentStep(5);
  };

  useEffect(() => {
    if (assessmentStep === 4) {
      orbScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1000 }),
          withTiming(1.0, { duration: 1000 })
        ),
        -1,
        true
      );
      orbOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 })
        ),
        -1,
        true
      );

      setAnalyzingText('Aptly AI iniciando análisis heurístico...');

      const t1 = setTimeout(() => {
        setAnalyzingText('Evaluando vocabulario técnico e interpretando escenarios...');
      }, 1500);

      const t2 = setTimeout(() => {
        setAnalyzingText('Comparando habilidades con estándares de la industria...');
      }, 3000);

      const t3 = setTimeout(() => {
        setAnalyzingText('Generando reporte de competencias y certificado...');
      }, 4500);

      const t4 = setTimeout(() => {
        runGrading();
      }, 6000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        orbScale.value = 1;
        orbOpacity.value = 0.6;
      };
    }
  }, [assessmentStep]);

  // Reset modal state when visible becomes true
  useEffect(() => {
    if (visible) {
      setAssessmentStep(0);
      setAiAnswers({ ans1: '', ans2: '', ans3: 3 });
      setAssessmentResult(null);
    }
  }, [visible]);

  const animatedOrbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: orbScale.value }],
      opacity: orbOpacity.value,
    };
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.aiModalContainer}>
        <BlurView style={StyleSheet.absoluteFillObject} intensity={40} tint="dark" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={styles.aiModalContent}>
            {/* Header */}
            {assessmentStep < 4 && (
              <View style={styles.aiModalHeader}>
                <Text style={styles.aiModalHeaderTitle}>Evaluador de IA</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.aiModalCloseBtn}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* Step 0: Welcome Screen */}
            {assessmentStep === 0 && (
              <ScrollView contentContainerStyle={styles.aiStepScroll}>
                <View style={{ alignItems: 'center', marginVertical: 15 }}>
                  <View style={styles.aiBrainIconBg}>
                    <MaterialCommunityIcons name="brain" size={48} color={COLORS.candidate} />
                  </View>
                </View>
                <Text style={styles.aiStepTitle}>Certificación de Competencias con IA</Text>
                <Text style={styles.aiStepSubtitle}>
                  El sistema de evaluación inteligente de Aptly validará tu nivel para la profesión seleccionada:
                </Text>
                <View style={styles.professionPill}>
                  <MaterialCommunityIcons name="briefcase" size={20} color={COLORS.candidate} style={{ marginRight: 8 }} />
                  <Text style={styles.professionPillText}>{profession || 'Sin profesión'}</Text>
                </View>

                <View style={styles.aiFeatureList}>
                  <View style={styles.aiFeatureItem}>
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={20} color={COLORS.candidate} />
                    <Text style={styles.aiFeatureText}>3 Preguntas técnicas y situaciones de crisis.</Text>
                  </View>
                  <View style={styles.aiFeatureItem}>
                    <MaterialCommunityIcons name="badge-account-outline" size={20} color={COLORS.candidate} />
                    <Text style={styles.aiFeatureText}>Certificado con puntuación neón en tu perfil.</Text>
                  </View>
                  <View style={styles.aiFeatureItem}>
                    <MaterialCommunityIcons name="eye" size={20} color={COLORS.candidate} />
                    <Text style={styles.aiFeatureText}>Altamente valorado y visible para las empresas.</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.aiActionBtn}
                  onPress={() => {
                    setAssessmentStep(1);
                    setAiAnswers({ ans1: '', ans2: '', ans3: 3 });
                  }}
                >
                  <Text style={styles.aiActionBtnText}>✨ Iniciar Evaluación con IA</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  style={{ alignSelf: 'center', marginTop: 15 }}
                >
                  <Text style={{ color: '#64748b', fontWeight: '600' }}>Tal vez más tarde</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Step 1 & 2: Open Questions */}
            {(assessmentStep === 1 || assessmentStep === 2) && (() => {
              const questions = getQuestionsForProfession(profession);
              const currentQ = questions[assessmentStep - 1];
              const currentVal = assessmentStep === 1 ? aiAnswers.ans1 : aiAnswers.ans2;
              const setVal = (text: string) => {
                setAiAnswers(prev => ({
                  ...prev,
                  [assessmentStep === 1 ? 'ans1' : 'ans2']: text
                }));
              };

              return (
                <ScrollView contentContainerStyle={styles.aiStepScroll} keyboardShouldPersistTaps="handled">
                  {/* Progress Meter */}
                  <View style={styles.aiProgressRow}>
                    <Text style={styles.aiProgressText}>Pregunta {assessmentStep} de 3</Text>
                    <View style={styles.aiProgressBarBg}>
                      <View style={[styles.aiProgressBarFill, { width: `${(assessmentStep / 3) * 100}%` }]} />
                    </View>
                  </View>

                  <Text style={styles.aiQuestionText}>{currentQ?.question}</Text>

                  <View style={styles.aiInputContainer}>
                    <TextInput
                      multiline
                      numberOfLines={6}
                      placeholder={currentQ?.placeholder || "Escribe tu respuesta técnica detallada aquí..."}
                      placeholderTextColor="#475569"
                      value={currentVal}
                      onChangeText={setVal}
                      style={styles.aiTextInput}
                      maxLength={500}
                    />
                    <Text style={styles.charCounter}>{currentVal.length}/500</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.aiActionBtn, { opacity: currentVal.trim().length > 10 ? 1 : 0.6 }]}
                    disabled={currentVal.trim().length <= 10}
                    onPress={() => {
                      if (assessmentStep === 1) {
                        setAssessmentStep(2);
                      } else {
                        setAssessmentStep(3);
                      }
                    }}
                  >
                    <Text style={styles.aiActionBtnText}>Continuar</Text>
                  </TouchableOpacity>

                  <Text style={styles.aiWarningHint}>Escribe al menos 10 caracteres para continuar.</Text>
                </ScrollView>
              );
            })()}

            {/* Step 3: Scale Question */}
            {assessmentStep === 3 && (() => {
              const questions = getQuestionsForProfession(profession);
              const currentQ = questions[2];
              const scaleVal = aiAnswers.ans3;

              return (
                <ScrollView contentContainerStyle={styles.aiStepScroll}>
                  {/* Progress Meter */}
                  <View style={styles.aiProgressRow}>
                    <Text style={styles.aiProgressText}>Pregunta 3 de 3</Text>
                    <View style={styles.aiProgressBarBg}>
                      <View style={[styles.aiProgressBarFill, { width: '100%' }]} />
                    </View>
                  </View>

                  <Text style={styles.aiQuestionText}>{currentQ?.question}</Text>

                  {/* 1-5 Scale Custom Pressables */}
                  <View style={styles.scaleContainer}>
                    {[1, 2, 3, 4, 5].map(num => {
                      const isSelected = scaleVal === num;
                      return (
                        <TouchableOpacity
                          key={num}
                          activeOpacity={0.8}
                          onPress={() => setAiAnswers(prev => ({ ...prev, ans3: num }))}
                          style={[
                            styles.scaleItem,
                            isSelected && styles.scaleItemActive
                          ]}
                        >
                          <Text style={[
                            styles.scaleNumber,
                            isSelected && styles.scaleNumberActive
                          ]}>
                            {num}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.scaleLabelsRow}>
                    <Text style={styles.scaleLabelText}>{currentQ?.scaleLabels?.min || 'Básico'}</Text>
                    <Text style={styles.scaleLabelText}>{currentQ?.scaleLabels?.max || 'Experto'}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.aiActionBtn}
                    onPress={() => {
                      setAssessmentStep(4); // Trigger analyzing
                    }}
                  >
                    <Text style={styles.aiActionBtnText}>✨ Finalizar y Evaluar</Text>
                  </TouchableOpacity>
                </ScrollView>
              );
            })()}

            {/* Step 4: Analyzing State */}
            {assessmentStep === 4 && (
              <View style={styles.aiAnalyzingContainer}>
                <Animated.View style={[styles.aiAnalyzingOrb, animatedOrbStyle]}>
                  <MaterialCommunityIcons name="brain" size={50} color="#FFF" />
                </Animated.View>

                <Text style={styles.aiAnalyzingTitle}>Procesando con Inteligencia Artificial</Text>
                <Text style={styles.aiAnalyzingText}>{analyzingText}</Text>
              </View>
            )}

            {/* Step 5: Results / Certificate */}
            {assessmentStep === 5 && assessmentResult && (
              <ScrollView contentContainerStyle={styles.aiStepScroll}>
                <Text style={[styles.aiStepTitle, { fontSize: 24, marginBottom: 5 }]}>¡Evaluación Completada!</Text>
                <Text style={styles.aiStepSubtitle}>Este es tu nivel y reporte acreditado de competencias:</Text>

                {/* Certificate Card */}
                <View style={styles.certificateCard}>
                  <View style={styles.certificateHeader}>
                    <MaterialCommunityIcons name="seal" size={24} color={COLORS.candidate} />
                    <Text style={styles.certificateHeaderText}>APTLY CERTIFIED PROFILE</Text>
                  </View>

                  <View style={styles.certBody}>
                    <View style={styles.certScoreContainer}>
                      <Text style={styles.certScore}>{assessmentResult.score}%</Text>
                      <Text style={styles.certScoreSub}>SCORE GLOBAL</Text>
                    </View>

                    <View style={styles.certMeta}>
                      <Text style={styles.certTierLabel}>NIVEL ASIGNADO</Text>
                      <Text style={styles.certTier}>{assessmentResult.tier}</Text>

                      <Text style={styles.certProfession}>{profession}</Text>
                    </View>
                  </View>

                  <View style={styles.certDivider} />

                  <View style={styles.certFeedbackContainer}>
                    <Text style={styles.certFeedbackTitle}>REPORTE DE FORTALEZAS (IA)</Text>
                    <Text style={styles.certFeedbackText}>
                      {assessmentResult.feedback}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.aiActionBtn}
                  onPress={() => {
                    onComplete(assessmentResult.tier, assessmentResult.score, assessmentResult.feedback);
                  }}
                >
                  <Text style={styles.aiActionBtnText}>Aplicar Nivel y Continuar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setAssessmentStep(0);
                    setAiAnswers({ ans1: '', ans2: '', ans3: 3 });
                  }}
                  style={{ alignSelf: 'center', marginTop: 15 }}
                >
                  <Text style={{ color: COLORS.candidate, fontWeight: '600' }}>Repetir Evaluación</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
