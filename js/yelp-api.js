var auth = {
    consumerKey: "q3AvYW42hVCxqsFC7A_fKw",
    consumerSecret: "Wh8quXYsfoQIANtM8N6Esnr0Irg",
    accessToken: "ac8SDEtb2lF2KhrP9y7x3fw_itVNwFGJ",
    accessTokenSecret: "mZLSv7WR2er_NELO7PNklfnSQrc",
  };

  var terms = 'food';
  var near = 'New+York';

  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };

  var parameters = [];
  parameters.push(['term', terms]);
  parameters.push(['location', near]);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);

  var message = {
    'action': 'http://api.yelp.com/v2/search',
    'method': 'GET',
    'parameters': parameters
  };

  OAuth.setTimestampAndNonce(message);

  OAuth.SignatureMethod.sign(message, accessor);

  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)

  var url = OAuth.addToURL(message.action,parameterMap);
  var response = UrlFetchApp.fetch(url).getContentText();
  var responseObject = Utilities.jsonParse(response);
  //have my JSON object, do whatever we want here, like add to spreadsheets