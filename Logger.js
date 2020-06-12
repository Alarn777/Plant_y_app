import {Storage} from 'aws-amplify';

export class Logger {
  static saveLogs(username, string, origin) {
    let dateString = new Date()
      .toISOString()
      .toString()
      .slice(0, -5);

    let fileName = 'log_' + dateString;

    Storage.put(
      username + '/Logs/' + fileName + '.json',
      {
        timestamp: dateString,
        error: string,
        origin: origin,
        username: username,
      },
      {
        contentType: 'json',
        level: 'public',
      },
    )
      .then()
      .catch();
  }
}
