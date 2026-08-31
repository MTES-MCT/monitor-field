import { RadioButton } from '@components/Elements/RadioButton'
import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { useTheme } from '@hooks/use-theme'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { useFeedbackForm } from '@hooks/useFeedBackForm'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, StyleSheet, Modal, View, TextInput, ActivityIndicator } from 'react-native'

export function UserFeedback() {
  const theme = useTheme()
  const styles = useThemedStyles(createStyles)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const { title, setTitle, description, setDescription, statut, canSend, submitFeedback, reset } = useFeedbackForm()

  function close() {
    reset()
    setIsFeedbackModalOpen(false)
  }

  return (
    <>
      <Pressable
        onPress={() => setIsFeedbackModalOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled: false }}
        style={() => [styles.buttonWrapper, { backgroundColor: theme.white }]}
      >
        <Image source={require('@assets/icons/message.svg')} style={styles.icon} />
      </Pressable>
      <Modal visible={isFeedbackModalOpen} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.modalWrapper}>
            {statut === 'success' ? (
              <>
                <ThemedText type="default" style={styles.titreSucces}>
                  Merci pour votre retour !
                </ThemedText>
                <Pressable style={styles.boutonPrincipal} onPress={close}>
                  <ThemedText style={styles.texteBouton}>Fermer</ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <ThemedText type="defaultBold">Retour utilisateurs</ThemedText>
                <View style={{ flexDirection: 'row', gap: Spacing.five, marginBottom: Spacing.five }}>
                  <RadioButton label="Bug" isSelected={false} onPress={() => {}} />
                  <RadioButton label="Suggestion" isSelected onPress={() => {}} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Titre court"
                  value={title}
                  onChangeText={setTitle}
                  editable={statut !== 'sending'}
                />
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Décris ce que tu as vu ou souhaité"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  editable={statut !== 'sending'}
                />
                {statut === 'error' && (
                  <ThemedText type="default" style={styles.erreur}>
                    L&apos;envoi a échoué. Vérifie ta connexion et réessaie.
                  </ThemedText>
                )}
                <Pressable
                  style={[styles.boutonPrincipal, !canSend && styles.boutonDesactive]}
                  onPress={submitFeedback}
                  disabled={!canSend || statut === 'sending'}
                >
                  {statut === 'sending' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText type="default" style={styles.texteBouton}>
                      Envoyer
                    </ThemedText>
                  )}
                </Pressable>
                <Pressable onPress={close}>
                  <ThemedText type="default" style={styles.annuler}>
                    Annuler
                  </ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

const createStyles = () =>
  StyleSheet.create({
    annuler: { color: '#666', marginTop: 12, textAlign: 'center' },
    boutonDesactive: { opacity: 0.4 },
    boutonPrincipal: { alignItems: 'center', backgroundColor: '#2563eb', padding: 14 },
    buttonWrapper: {
      alignItems: 'center',
      height: 48,
      justifyContent: 'center',
      width: 48
    },
    erreur: { color: '#c0392b', marginBottom: 12 },
    icon: {
      height: Spacing.five,
      width: Spacing.five
    },
    input: { borderColor: '#ddd', borderWidth: 1, marginBottom: 12, padding: 12 },
    modalWrapper: { backgroundColor: '#fff', padding: 20 },
    overlay: { backgroundColor: 'rgba(0,0,0,0.5)', flex: 1, justifyContent: 'flex-end' },
    textarea: { minHeight: 100, textAlignVertical: 'top' },
    texteBouton: { color: '#fff', fontWeight: '600' },
    titreSucces: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' }
  })
