import initState from './handlers/initState';
import defaultState from './handlers/defaultState';
import { extractArticleId } from 'src/lib/sharedUtils';
import tutorial, { TUTORIAL_STEPS } from './handlers/tutorial';
import handlePostback from './handlePostback';

/**
 * Given input event and context, outputs the new context and the reply to emit.
 *
 * @param {Object<data>} context The current context of the bot
 * @param {*} event The input event
 * @param {*} userId LINE user ID that does the input
 */
export default async function handleInput({ data = {} }, event, userId) {
  let state;
  let replies;

  if (event.input === undefined) {
    throw new Error('input undefined');
  }

  if (event.type === 'message') {
    // Trim input because these may come from other chatbot
    //
    const trimmedInput = event.input.trim();
    const articleId = extractArticleId(trimmedInput);
    if (articleId) {
      // Start new session, reroute to CHOOSING_ARTILCE and simulate "choose article" postback event
      data = {
        // Start a new session
        sessionId: Date.now(),
        searchedText: '',
      };
      event = {
        type: 'postback',
        input: articleId,
      };
      return await handlePostback({ data }, 'CHOOSING_ARTICLE', event, userId);
    } else if (event.input === TUTORIAL_STEPS['RICH_MENU']) {
      state = 'TUTORIAL';
    } else {
      // The user forwarded us an new message.
      // Create a new "search session".
      //
      data = {
        // Used to determine button postbacks and GraphQL requests are from
        // previous sessions
        //
        sessionId: Date.now(),
      };
      state = '__INIT__';
    }
  } else {
    state = 'Error';
  }

  let params = {
    data,
    state,
    event,
    userId,
    replies,
  };

  // Sets data and replies
  //
  switch (params.state) {
    case '__INIT__': {
      params = await initState(params);
      break;
    }
    case 'TUTORIAL': {
      params = tutorial(params);
      break;
    }

    default: {
      params = defaultState(params);
      break;
    }
  }

  ({ data, replies } = params);

  return {
    context: { data },
    replies,
  };
}
