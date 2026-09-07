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
import {
  Pressable,
  StyleSheet,
  Modal,
  View,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export function UserFeedback() {
  const theme = useTheme()
  const styles = useThemedStyles(createStyles)
  const globalStyle = useGlobalStyle()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const {
    title,
    setTitle,
    description,
    setDescription,
    setType,
    type,
    statut,
    canSend,
    submitFeedback,
    reset,
    email,
    setEmail
  } = useFeedbackForm()

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
          <KeyboardAvoidingView behavior="padding">
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
              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalWrapper}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.titleWrapper}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="large">Retours utilisateurs</ThemedText>
                  </View>
                  <CloseButton onClose={close} />
                </View>

                <View style={styles.radioButtonsWrapper}>
                  <RadioButton label="Bug" isSelected={type === 'bug'} onPress={() => setType('bug')} />
                  <RadioButton
                    label="Suggestion"
                    isSelected={type === 'suggestion'}
                    onPress={() => setType('suggestion')}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <ThemedText type="label">Email</ThemedText>
                  <TextInput
                    style={globalStyle.textInputGray}
                    value={email}
                    onChangeText={setEmail}
                    editable={statut !== 'sending'}
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <ThemedText type="label">
                    Objet{' '}
                    <ThemedText type="label" style={globalStyle.requiredField}>
                      *
                    </ThemedText>
                  </ThemedText>
                  <TextInput
                    style={globalStyle.textInputGray}
                    value={title}
                    onChangeText={setTitle}
                    editable={statut !== 'sending'}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <ThemedText type="label">
                    Description{' '}
                    <ThemedText type="label" style={globalStyle.requiredField}>
                      *
                    </ThemedText>
                  </ThemedText>
                  <TextInput
                    style={[globalStyle.textInputGray, styles.textarea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    editable={statut !== 'sending'}
                  />
                </View>
                <View style={styles.separator} />
                <View style={styles.buttonsWrapper}>
                  <Pressable onPress={close} style={globalStyle.buttonBase}>
                    <ThemedText type="default">Annuler</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[globalStyle.buttonBase, { backgroundColor: theme.charcoal }]}
                    onPress={submitFeedback}
                    disabled={!canSend || statut === 'sending'}
                  >
                    {statut === 'sending' ? (
                      <ActivityIndicator color={theme.white} />
                    ) : (
                      <ThemedText type="default" themeColor="white">
                        Envoyer
                      </ThemedText>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  )
}

const createStyles = theme =>
  StyleSheet.create({
    buttonsWrapper: {
      gap: Spacing.two,
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.four
    },
    inputWrapper: {
      gap: Spacing.one,
      paddingHorizontal: Spacing.four
    },
    modalScroll: {
      backgroundColor: theme.white,
      flexGrow: 0
    },
    modalWrapper: {
      gap: Spacing.four,
      paddingBottom: Spacing.three,
      paddingTop: Spacing.three
    },
    overlay: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 0
    },
    radioButtonsWrapper: {
      flexDirection: 'row',
      gap: Spacing.five,
      paddingHorizontal: Spacing.four
    },
    separator: {
      backgroundColor: theme.lightGray,
      height: 1,
      marginTop: 48
    },
    textarea: {
      height: 120,
      textAlignVertical: 'top'
    },
    titleWrapper: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.four
    }
  })
