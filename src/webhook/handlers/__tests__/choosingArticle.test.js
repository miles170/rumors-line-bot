jest.mock('src/lib/gql');
jest.mock('src/lib/ga');

import MockDate from 'mockdate';
import choosingArticle from '../choosingArticle';
import * as apiGetArticleResult from '../__fixtures__/choosingArticle';
import * as apiGetReplyResult from '../__fixtures__/choosingReply';
import { POSTBACK_NO_ARTICLE_FOUND } from '../utils';
import gql from 'src/lib/gql';
import ga from 'src/lib/ga';

import UserArticleLink from '../../../database/models/userArticleLink';

beforeAll(async () => {
  if (await UserArticleLink.collectionExists()) {
    await (await UserArticleLink.client).drop();
  }
});

beforeEach(() => {
  ga.clearAllMocks();
  gql.__reset();
});

it('should select article by articleId', async () => {
  gql.__push(apiGetArticleResult.selectedArticleId);

  const params = {
    data: {
      searchedText:
        '《緊急通知》\n台北馬偕醫院傳來訊息：\n資深醫生（林清風）傳來：「請大家以後千萬不要再吃生魚片了！」\n因為最近已經發現- 好多病人因為吃了生魚片，胃壁附著《海獸胃腺蟲》，大小隻不一定，有的病人甚至胃壁上滿滿都是無法夾出來，驅蟲藥也很難根治，罹患機率每個國家的人都一樣。\n尤其；鮭魚的含蟲量最高、最可怕！\n請傳給朋友，讓他們有所警惕!',
    },
    event: {
      type: 'postback',
      input: 'article-id',
      timestamp: 1519019734813,
      postback: {
        data:
          '{"input":"article-id","sessionId":1497994017447,"state":"CHOOSING_ARTICLE"}',
      },
    },
    issuedAt: 1505314295017,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
  };

  expect(await choosingArticle(params)).toMatchSnapshot();
  expect(gql.__finished()).toBe(true);
  expect(ga.eventMock.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "ea": "Selected",
          "ec": "Article",
          "el": "article-id",
        },
      ],
      Array [
        Object {
          "ea": "Search",
          "ec": "Reply",
          "el": "AVygFA0RyCdS-nWhuaXY",
          "ni": true,
        },
      ],
      Array [
        Object {
          "ea": "Search",
          "ec": "Reply",
          "el": "AVy6LkWIyCdS-nWhuaqu",
          "ni": true,
        },
      ],
    ]
  `);
  expect(ga.sendMock).toHaveBeenCalledTimes(1);
});

it('throws ManipulationError when articleId is not valid', async () => {
  gql.__push({ data: { GetArticle: null } });

  const params = {
    data: {},
    event: {
      type: 'postback',
      input: 'article-id',
    },
    issuedAt: 1505314295017,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
  };

  await expect(choosingArticle(params)).rejects.toMatchInlineSnapshot(
    `[Error: Provided message is not found.]`
  );
  expect(gql.__finished()).toBe(true);
});

it('should select article and have OPINIONATED and NOT_ARTICLE replies', async () => {
  gql.__push(apiGetArticleResult.multipleReplies);

  const params = {
    data: {
      searchedText:
        '老榮民九成存款全部捐給慈濟，如今窮了卻得不到慈濟醫院社工的幫忙，竟翻臉不認人',
    },
    event: {
      type: 'postback',
      input: 'article-id',
      timestamp: 1519019734813,
      postback: {
        data:
          '{"input":"article-id","sessionId":1497994017447,"state":"CHOOSING_ARTICLE"}',
      },
    },
    issuedAt: 1511633232970,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
    replies: undefined,
  };

  expect(await choosingArticle(params)).toMatchSnapshot();
  expect(gql.__finished()).toBe(true);
  expect(ga.eventMock.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "ea": "Selected",
          "ec": "Article",
          "el": "article-id",
        },
      ],
      Array [
        Object {
          "ea": "Search",
          "ec": "Reply",
          "el": "AV--O3nfyCdS-nWhujMD",
          "ni": true,
        },
      ],
      Array [
        Object {
          "ea": "Search",
          "ec": "Reply",
          "el": "AV8fXikZyCdS-nWhuhfN",
          "ni": true,
        },
      ],
      Array [
        Object {
          "ea": "Search",
          "ec": "Reply",
          "el": "AV--LRZYyCdS-nWhujL9",
          "ni": true,
        },
      ],
      Array [
        Object {
          "ea": "Search",
          "ec": "Reply",
          "el": "AV8jkRlByCdS-nWhuhiY",
          "ni": true,
        },
      ],
    ]
  `);
  expect(ga.sendMock).toHaveBeenCalledTimes(1);
});

it('should select article with no replies', async () => {
  gql.__push(apiGetArticleResult.noReplies);
  gql.__push(apiGetArticleResult.createOrUpdateReplyRequest);

  const params = {
    data: {
      searchedText: '老司機車裡總備一塊香皂，知道內情的新手默默也準備了一塊',
    },
    event: {
      type: 'postback',
      input: 'article-id',
      timestamp: 1519019734813,
      postback: {
        data:
          '{"input":"article-id","sessionId":1497994017447,"state":"CHOOSING_ARTICLE"}',
      },
    },
    issuedAt: 1511702208730,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
    replies: undefined,
  };

  MockDate.set('2020-01-01');
  expect(await choosingArticle(params)).toMatchSnapshot();
  MockDate.reset();

  expect(gql.__finished()).toBe(true);
  expect(ga.eventMock.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "ea": "Selected",
          "ec": "Article",
          "el": "article-id",
        },
      ],
      Array [
        Object {
          "ea": "NoReply",
          "ec": "Article",
          "el": "article-id",
        },
      ],
    ]
  `);
  expect(ga.sendMock).toHaveBeenCalledTimes(1);
});

it('should select article and choose the only one reply for user', async () => {
  gql.__push(apiGetArticleResult.oneReply);
  gql.__push(apiGetReplyResult.oneReply2);

  const params = {
    data: {
      searchedText:
        'Just One Reply Just One Reply Just One Reply Just One Reply Just One Reply',
    },
    event: {
      type: 'postback',
      input: 'article-id',
      timestamp: 1519019734813,
      postback: {
        data:
          '{"input":"article-id","sessionId":1497994017447,"state":"CHOOSING_ARTICLE"}',
      },
    },
    issuedAt: 1511702208730,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
    replies: undefined,
  };

  expect(await choosingArticle(params)).toMatchSnapshot();
  expect(gql.__finished()).toBe(true);
  expect(ga.eventMock.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "ea": "Selected",
          "ec": "Article",
          "el": "article-id",
        },
      ],
      Array [
        Object {
          "ea": "Selected",
          "ec": "Reply",
          "el": "AV--O3nfyCdS-nWhujMD",
        },
      ],
      Array [
        Object {
          "ea": "Type",
          "ec": "Reply",
          "el": "RUMOR",
          "ni": true,
        },
      ],
    ]
  `);
  expect(ga.sendMock).toHaveBeenCalledTimes(2);
});

it('should block non-postback interactions', async () => {
  const params = {
    data: {
      searchedText:
        'Just One Reply Just One Reply Just One Reply Just One Reply Just One Reply',
    },
    event: {
      type: 'message',
      input: 'This is a message',
      timestamp: 1511702208226,
      message: { type: 'text', id: '7049700770815', text: '10' },
    },
    issuedAt: 1511702208730,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
    replies: undefined,
  };

  await expect(choosingArticle(params)).rejects.toMatchInlineSnapshot(
    `[Error: Please choose from provided options.]`
  );
});

it('should select article and slice replies when over 10', async () => {
  gql.__push(apiGetArticleResult.elevenReplies);

  const params = {
    data: {
      searchedText:
        '老榮民九成存款全部捐給慈濟，如今窮了卻得不到慈濟醫院社工的幫忙，竟翻臉不認人',
    },
    event: {
      type: 'postback',
      input: 'article-id',
      timestamp: 1519019734813,
      postback: {
        data:
          '{"input":"article-id","sessionId":1497994017447,"state":"CHOOSING_ARTICLE"}',
      },
    },
    issuedAt: 1511633232970,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
    replies: undefined,
  };

  expect(await choosingArticle(params)).toMatchSnapshot();
  expect(gql.__finished()).toBe(true);
});

it('should ask users if they want to submit article when user say not found', async () => {
  const params = {
    data: {
      searchedText:
        '這一篇文章確實是一個轉傳文章，他夠長，看起來很轉傳，但是使用者覺得資料庫裡沒有。',
    },
    event: {
      type: 'postback',
      input: POSTBACK_NO_ARTICLE_FOUND,
      timestamp: 1519019734813,
      postback: {
        data: `{"input":"${POSTBACK_NO_ARTICLE_FOUND}","sessionId":1497994017447,"state":"CHOOSING_ARTICLE"}`,
      },
    },
    issuedAt: 1511633232970,
    userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
    replies: undefined,
  };

  MockDate.set('2020-01-01');
  const result = await choosingArticle(params);
  MockDate.reset();

  expect(result).toMatchSnapshot();
  expect(ga.eventMock.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "ea": "ArticleSearch",
          "ec": "UserInput",
          "el": "ArticleFoundButNoHit",
        },
      ],
    ]
  `);
  expect(ga.sendMock).toHaveBeenCalledTimes(1);
});

it('should create a UserArticleLink when selecting a article', async () => {
  const userId = 'user-id-0';
  const params = {
    data: {
      searchedText: '《緊急通知》',
    },
    event: {
      type: 'postback',
      input: 'article-id',
      timestamp: 1519019734813,
      postback: {
        data:
          '{"input":"article-id","sessionId":1497994017447,"state":"CHOOSING_ARTICLE"}',
      },
    },
    issuedAt: 1505314295017,
    userId,
  };

  MockDate.set('2020-01-01');
  gql.__push(apiGetArticleResult.selectedArticleId);
  await choosingArticle(params);
  MockDate.reset();

  const userArticleLinks = await UserArticleLink.findByUserId(userId);
  expect(userArticleLinks.map(e => ({ ...e, _id: '_id' }))).toMatchSnapshot();
});
