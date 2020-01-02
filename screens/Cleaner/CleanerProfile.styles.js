import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8BC34A',
    height: 200
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 130
  },
  bodyContent: {
    marginTop: 40,
    alignItems: 'center',
    padding: 30
  },
  name: {
    marginTop: 40,
    fontSize: 28,
    color: '#696969',
    fontWeight: '600'
  },
  info: {
    fontSize: 16,
    color: '#00BFFF',
    marginTop: 10
  },
  starRating: { marginTop: 100 },
  logOutButton: { margin: 15 },
  activityIndicator: { flex: 1 }
})

export default styles
