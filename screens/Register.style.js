import { StyleSheet } from 'react-native'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
    // backgroundColor: '#DCDCDC',
  },
  buttonOK: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: '#ffc107'
  },
  registerButton: { margin: 15 },
  radioSelect: { marginTop: 8, marginLeft: 10 },
  logo: { height: 70, margin: 10 },
  backgroundImage: { width: '100%', height: '100%' },
  headerImage: { height: 40 },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderBottomWidth: 1,
    width: 300,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    flex: 1
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30
  },
  loginButton: {
    backgroundColor: '#8BC34A'
  },
  loginText: {
    // color: 'white',
  }
})

export default styles
