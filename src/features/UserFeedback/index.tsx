import { CloseButton } from '@components/Buttons/CloseButton'
import { RadioButton } from '@components/Elements/RadioButton'
import { ThemedText } from '@components/Elements/Text'
import { Spacing } from '@constants/theme'
import { useGlobalStyle } from '@globalStyle'
import { useTheme } from '@hooks/use-theme'
import { useThemedStyles } from '@hooks/use-themed-styles'
import { useFeedbackForm } from '@hooks/useFeedBackForm'
import { Image } from 'expo-image'
import { useState } from 'react'
import { Pressable, StyleSheet, Modal, View, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function UserFeedback() {
  const theme = useTheme()
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const { title, setTitle, description, setDescription, setType, type, statut, canSend, submitFeedback, reset } =
    useFeedbackForm()

  function close() {
    reset()
    setIsFeedbackModalOpen(false)
  }

  return (
    <>
      <Pressable
        onPress={() => setIsFeedbackModalOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled: isFeedbackModalOpen }}
        style={[globalStyle.buttonBase, { backgroundColor: theme.white, marginTop: Spacing.two }]}
      >
        <Image source={require('@assets/icons/message.svg')} style={globalStyle.iconNormal} />
      </Pressable>
      <Modal visible={isFeedbackModalOpen} animationType="slide" transparent onRequestClose={close}>
        <SafeAreaView style={styles.overlay}>
          <KeyboardAvoidingView style={styles.modalWrapper} behavior="padding">
            {statut === 'success' ? (
              <View style={{ alignItems: 'center', gap: Spacing.five, justifyContent: 'space-between' }}>
                <ThemedText type="large">Merci pour votre retour !</ThemedText>
                <Pressable style={[globalStyle.buttonBase, { backgroundColor: theme.charcoal }]} onPress={close}>
                  <ThemedText type="default" themeColor="white">
                    Fermer
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.titleWrapper}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="large">Retour utilisateurs</ThemedText>
                  </View>
                  <CloseButton onClose={close} />
                </View>

                <View style={{ flexDirection: 'row', gap: Spacing.five }}>
                  <RadioButton label="Bug" isSelected={type === 'bug'} onPress={() => setType('bug')} />
                  <RadioButton
                    label="Suggestion"
                    isSelected={type === 'suggestion'}
                    onPress={() => setType('suggestion')}
                  />
                </View>
                <TextInput
                  style={globalStyle.textInput}
                  placeholder="Titre"
                  autoFocus
                  value={title}
                  onChangeText={setTitle}
                  editable={statut !== 'sending'}
                />
                <TextInput
                  style={[globalStyle.textInput, styles.textarea]}
                  placeholder="Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  editable={statut !== 'sending'}
                />
                <View style={{ gap: Spacing.two, justifyContent: 'space-between', paddingBottom: 60 }}>
                  <Pressable onPress={close} style={globalStyle.buttonBase}>
                    <ThemedText type="default">Annuler</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[globalStyle.buttonBase, { backgroundColor: theme.charcoal }]}
                    onPress={submitFeedback}
                    disabled={!canSend || statut === 'sending'}
                  >
                    {statut === 'sending' ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText type="default" themeColor="white">
                        Envoyer
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    modalWrapper: {
      backgroundColor: theme.white,
      flexShrink: 1,
      gap: Spacing.four,
      paddingBottom: Spacing.three,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three
    },
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 0
    },
    textarea: {
      minHeight: 100,
      textAlignVertical: 'top'
    },
    titleWrapper: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }
  })
