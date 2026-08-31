# ARCHITECTURE.md — packet flows by feature

`EVENTS.MD` is the dictionary: every packet, its opcode, its wire format. This file is the grammar: **which packets go together, in what order, and who starts the conversation.**

Use them together. When you implement a feature server-side, find the flow here to learn the sequence, then look each packet up in `EVENTS.MD` for the exact bytes.

Opcodes are quoted inline as `incoming 1234` (client incoming server, you parse it) and `outgoing 1234` (server incoming client, you compose it).

---

## Contents

- [Coverage](#coverage)
- [Part A — How messages move through the client](#part-a--how-messages-move-through-the-client)
- [Part B — Flows](#part-b--flows)
  - [1. Connection, handshake & authentication](#1-connection-handshake--authentication)
  - [2. Session bootstrap](#2-session-bootstrap)
  - [3. Navigator](#3-navigator)
  - [4. Room entry](#4-room-entry)
  - [5. Presence & chat](#5-presence--chat)
  - [6. Furniture](#6-furniture)
  - [7. Catalog & purchasing](#7-catalog--purchasing)
  - [8. Inventory](#8-inventory)
  - [9. Trading](#9-trading)
  - [10. Friends & messenger](#10-friends--messenger)
  - [11. User profile & respects](#11-user-profile--respects)
  - [12. Avatar & wardrobe](#12-avatar--wardrobe)
  - [13. Room settings & ownership](#13-room-settings--ownership)
  - [14. Groups](#14-groups)
  - [15. Wired](#15-wired)
  - [16. Moderation](#16-moderation)
  - [17. Help / call for help](#17-help--call-for-help)
  - [18. Notifications](#18-notifications)
- [Part C — Implementing a new flow](#part-c--implementing-a-new-flow)
- [Part D — Known traps](#part-d--known-traps)

---

---

## Coverage

The goal is every flow. Sections marked **complete** cover 100% of the packets in their `EVENTS.MD` categories, including the ones that are registered but dormant — those are listed explicitly so you know not to implement them. Partial sections cover the main path only.

| Section | Packets covered | Status |
|---|---|---|
| 1. Connection, handshake & authentication | 26 / 26 | **complete** |
| 3. Navigator | 73 / 73 | **complete** |
| 4. Room entry / 5. Presence & chat / 6. Furniture | 62 / 175 | partial |
| 7. Catalog & purchasing | 12 / 99 | partial |
| 8. Inventory | 16 / 63 | partial |
| 9. Trading | 19 / 19 | **complete** |
| 10. Friends & messenger | 17 / 32 | partial |
| 11-12. Profile, avatar, settings | 18 / 58 | partial |
| 14. Groups | 14 / 59 | partial |
| 15. Wired | 9 / 29 | partial |
| 16. Moderation | 25 / 36 | partial |
| 17. Help / CFH | 5 / 56 | partial |
| 18. Notifications | 9 / 26 | partial |
| — Games (not yet written) | 0 / 42 | not started |
| — Quests (not yet written) | 0 / 30 | not started |
| — Sounds / jukebox (not yet written) | 0 / 17 | not started |
| — Camera / photos (not yet written) | 0 / 12 | not started |
| — Crafting (not yet written) | 0 / 9 | not started |
| — Competitions (not yet written) | 0 / 15 | not started |
| — Rentables (not yet written) | 0 / 10 | not started |
| — NUX / welcome / email / phone (not yet written) | 1 / 27 | partial |
| **Total** | **306 / 913 (34%)** | |

Counts are mechanical: a packet is "covered" when its composer/event class is named in this file. Regenerate after editing.

---

# Part A — How messages move through the client

Two codebases are involved, and knowing which one owns a packet tells you where to look:

| | |
|---|---|
| `../renderer` (`@nitrots/nitro-renderer`) | protocol, room rendering, session state. Owns the handshake, room entry, and everything the room canvas needs. |
| `nitro` (this repo) | React UI. Owns the windows — catalog, inventory, navigator, trading, profiles. |

`node_modules/@nitrots/nitro-renderer` is a symlink to `../renderer`, so edits there are live.

## Sending

```ts
SendMessageComposer(new GetCatalogPageComposer(pageId, offerId, 'NORMAL'));
```

`SendMessageComposer` (`src/api/nitro/SendMessageComposer.ts`) is a one-liner over `GetConnection().send()`. The composer's `getMessageArray()` is encoded by `EvaWireFormat` using the runtime type of each array element — see the wire table at the top of `EVENTS.MD`.

**A composer must be registered in `NitroMessages.ts` to be sendable.** The connection resolves the opcode by looking the class up in the `_composers` map; an unregistered composer has no opcode and is silently dropped.

## Receiving

```ts
useMessageEvent<CatalogPageMessageEvent>(CatalogPageMessageEvent, event =>
{
    const parser = event.getParser();
    setPageData(parser.offers);
});
```

`useMessageEvent` (`src/hooks/events/useMessageEvent.tsx`) registers the event on mount and removes it on unmount. The class you pass is both the type and the value — it constructs `new eventType(handler)` internally.

Each incoming class pairs with a parser: `CatalogPageMessageEvent` incoming `CatalogPageMessageParser`. The parser's `parse()` body **is** the wire format. `event.getParser()` returns it, and you read typed getters off it. Part 2 of `EVENTS.MD` prints each `parse()` body verbatim.

The handler identity matters — `useMessageEvent` re-registers whenever `handler` changes. Handlers defined inline in a component body are re-created every render, which is fine because the hook cleans up, but it means you should not rely on registration being stable.

## `useMessageEvent` vs `useUiEvent`

These look similar and are constantly confused. They are unrelated transports:

| | `useMessageEvent` | `useUiEvent` |
|---|---|---|
| Source | the socket — a real packet from the game server | `UI_EVENT_DISPATCHER`, an in-process event bus |
| Payload | `event.getParser()`, typed from the wire | a `NitroEvent` subclass constructed in JS |
| Use for | reacting to server state | one part of the UI telling another to open, close, or refresh |

`useUiEvent` never touches the network. It is how, for example, clicking a furni in the room opens the right window. Typically it is wrapped in a feature hook, and the components that need the state just call the hook rather than subscribing themselves.

A common pattern combines both: a `useUiEvent` handler fires a `SendMessageComposer`, and a `useMessageEvent` handler catches the reply and pushes it into state.

## State sharing

Feature hooks use `useBetween` (`use-between`) to make one hook instance shared across every component that calls it — see `useSessionInfo`, `usePurse`, `useNavigator`. This is why a packet handler registered "in a hook" fires only once even when ten components use that hook. When you add a flow, follow this: register the `useMessageEvent` inside the shared hook, not in each consuming component.

---

# Part B — Flows

## 1. Connection, handshake & authentication

**Complete — all 26 packets in `HANDSHAKE`, `AUTHENTICATION`, `CLIENT`, `SECURITY` and `AVAILABILITY` are covered below.**

**Owner:** `../renderer/src/nitro/communication/NitroCommunicationDemo.ts` for the handshake, `LatencyTracker.ts` for latency, `../renderer/src/nitro/session/SessionDataManager.ts` for hotel status.

### 1.1 The live path

The client opens the socket and immediately, without waiting for anything:

```
socket opens
  incoming 4000  RELEASE_VERSION    ClientHelloMessageComposer
  incoming 882   SECURITY_TICKET    SSOTicketMessageComposer(ticket, time)
```

Then it waits. The **only** thing it is waiting for is:

```
  outgoing 230   AUTHENTICATED      AuthenticationOKMessageEvent   (no payload — header only)
```

On receiving `230` the client considers itself logged in, dispatches `CONNECTION_AUTHENTICATED` internally, and immediately asks for the user:

```
  incoming 756   USER_INFO          InfoRetrieveMessageComposer    (no payload)
```

So the minimum viable server handshake is: **accept `882`, validate the ticket, reply `230`, then answer the `756` that follows.**

| Packet | Payload |
|---|---|
| `incoming 4000` `ClientHelloMessageComposer` | `string releaseVersion`, `string type`, `int32 platform`, `int32 deviceCategory` |
| `incoming 882` `SSOTicketMessageComposer` | `string ticket`, `int32 time` |
| `incoming 756` `InfoRetrieveMessageComposer` | none |
| `outgoing 230` `AuthenticationOKMessageEvent` | none |

Notes that will save you time:

- `ClientHelloMessageComposer` **ignores its constructor arguments** and hardcodes the payload: `"NITRO-<version>"`, `"HTML5"`, `2` (`ClientPlatformEnum.HTML5`), `1` (`ClientDeviceCategoryEnum.BROWSER`). Passing values in has no effect. The call site is literally `new ClientHelloMessageComposer(null, null, null, null)`.
- There is no client-side timeout on `230`. If you never send it, the client sits on a blank screen with no error. Send `outgoing 4000 DISCONNECT_REASON` instead of hanging.
- Login **requires** an SSO ticket. Without `sso.ticket` in config the client logs `Login without an SSO ticket is not supported`, dispatches `CONNECTION_HANDSHAKE_FAILED`, and never sends `882`.
- The `time` field of `882` is `GetTickerTime()` — the renderer's ticker, not a wall clock. Do not validate it as a timestamp.

### 1.2 Keepalive

```
  outgoing 1407  CLIENT_PING        PingMessageEvent          (no payload)
  incoming 362   CLIENT_PONG        PongMessageComposer       (no payload)
```

The client answers every `1407` with a `362`. Optionally, if `system.pong.manually` is configured true, it also sends `362` unprompted every `system.pong.interval.ms` (default 20000). Either mechanism holds the connection open.

### 1.3 Latency measurement

Live, and separate from the ping/pong keepalive. Driven by `LatencyTracker`, started from `Nitro.init()` and running every 20s:

```
  incoming 544   CLIENT_LATENCY          LatencyPingRequestMessageComposer(requestId)
  outgoing 188   CLIENT_LATENCY          LatencyPingResponseMessageEvent(requestId)
  incoming 1744  CLIENT_LATENCY_MEASURE  LatencyPingReportMessageComposer(avgMs, avgFilteredMs, sampleCount)
```

**Echo the `requestId` from `544` back in `188` unchanged** — the tracker matches responses to pending requests by that id and silently discards anything it did not ask for.

The report (`1744`) is not sent every cycle. The tracker discards one warm-up sample, collects 100, then reports the average and a filtered average (samples below 2× the mean), and only if the average moved by more than 3ms since the last report. It is telemetry — you may ignore it.

### 1.4 Hotel availability

`AvailabilityStatusMessageEvent` is consumed by `SessionDataManager`; the other four surface as UI notifications via `useNotification`. All are server-initiated — there is no request half.

```
  outgoing 1350  AVAILABILITY_STATUS         AvailabilityStatusMessageEvent
              boolean isOpen, boolean onShutdown, [optional] boolean isAuthenticUser
  outgoing 3058  HOTEL_CLOSES_AND_OPENS_AT   InfoHotelClosedMessageEvent
              int32 openHour, int32 openMinute, boolean userThrownOutAtClose
  outgoing 184   HOTEL_WILL_CLOSE_MINUTES    InfoHotelClosingMessageEvent
              int32 minutes
  outgoing 698   HOTEL_CLOSED_AND_OPENS      LoginFailedHotelClosedMessageEvent
              int32 openHour, int32 openMinute
  outgoing 1737  HOTEL_MAINTENANCE           MaintenanceStatusMessageEvent
              boolean isInMaintenance, int32 minutesUntilMaintenance, int32 duration
```

`1350` sets `systemOpen`, `systemShutdown` and `isAuthenticHabbo` on the session. The third field is guarded by `bytesAvailable` — you may omit it.

Use `698` when refusing a login because the hotel is shut; use `3058` for an already-connected client. Both take an open time, not a duration.

⚠️ `outgoing AvailabilityTimeMessageEvent` (`AVAILABILITY_TIME`, `int32 minutesUntilChange`) holds the **placeholder opcode `-1`** and nothing listens to it. It cannot be sent.

### 1.5 Noobness

```
  outgoing 70    NOOBNESS_LEVEL     NoobnessLevelMessageEvent    (int32 noobnessLevel)
```

Read by `SessionDataManager` into `noobnessLevel` and used to gate new-user hand-holding. Send it after `230` if you want the NUX behaviour; omitting it leaves the level at its default.

### 1.6 Dormant — registered but never used

These are in the protocol and registered in `NitroMessages.ts`, but **no code path sends or handles them**. Implementing them server-side gains you nothing until the client is changed.

| Packet | Payload | Status |
|---|---|---|
| `incoming -1` `AuthenticationMessageComposer` | dynamic key/value pairs | ⚠️ placeholder opcode — unsendable |
| `incoming 2022` `InitDiffieHandshakeMessageComposer` | none | never sent |
| `outgoing 3309` `InitDiffieHandshakeEvent` | `string encryptedPrime`, `string encryptedGenerator` | no listener |
| `incoming 2526` `CompleteDiffieHandshakeMessageComposer` | `string publicKey` | never sent |
| `outgoing 3401` `CompleteDiffieHandshakeEvent` | `string encryptedPublicKey`, `boolean serverClientEncryption` | no listener |
| `incoming 2309` `UniqueIDMessageComposer` | `string machineId`, `string fingerprint`, `string flashVersion` | never sent |
| `incoming 3584` `VersionCheckMessageComposer` | `int32 clientID`, `string clientURL`, `string externalVariablesURL` | never sent |
| `incoming 2864` `DisconnectMessageComposer` | none | never sent |
| `outgoing 1343` `IdentityAccountsEvent` | counted map of account ids incoming names | no listener |

The **Diffie-Hellman handshake is entirely dormant.** Nitro authenticates with a plain SSO ticket over whatever transport security the socket already has. Do not build the DH exchange expecting the client to participate.

### 1.7 Disconnection

```
  outgoing 4000  DISCONNECT_REASON  DisconnectReasonEvent    (int32 reason)
```

Handled by `useNotification`, which maps the reason code to a dialog. Note `4000` is `RELEASE_VERSION` outgoing and `DISCONNECT_REASON` incoming — same number, opposite directions, unrelated packets. Do not let them collide in a shared opcode table.

---

## 2. Session bootstrap

Everything here is the client reacting to `230` and populating the UI shell. A server that answers only the handshake gets a logged-in client with an empty toolbar.

### The user object

```
  incoming 756   USER_INFO          InfoRetrieveMessageComposer
  outgoing 3985  USER_INFO          UserObjectEvent
```

`3985` is the single most important packet after auth. It carries `UserInfoDataParser`: id, name, figure, sex, motto, real name, respects remaining, pet respects remaining, and stream-publishing flags. `useSessionInfo` reads it into shared state; the avatar image, the toolbar, and the profile all depend on it. Send it before anything else that references the user.

### Permissions

```
  outgoing 3599  USER_PERMISSIONS   UserRightsMessageEvent
```

Club level, security level, whether the account is an ambassador. Gates the moderation tools and staff-only UI. Send unprompted after `3985`.

### Currency

Two independent flows, both driven by `usePurse` (`src/hooks/purse/usePurse.ts`):

```
  incoming 540   USER_CURRENCY      GetCreditsInfoComposer
  outgoing 3642  USER_CREDITS       CreditBalanceEvent        (credits as a string)
  outgoing 509   USER_CURRENCY      UserCurrencyEvent         (map of activityPointType incoming amount)
```

Then, on a 50-second interval:

```
  incoming 1071  USER_SUBSCRIPTION  ScrGetUserInfoMessageComposer('habbo_club')
  outgoing 1097  USER_SUBSCRIPTION  ScrSendUserInfoEvent
```

`1097` drives club status, days remaining, and the HC badge. The client polls it every 50s whether or not anything changed, so make it cheap.

Balance changes are pushed, never polled: re-send `3642` / `509` whenever credits or points move. `HabboActivityPointNotificationMessageEvent` additionally animates a "+N" in the purse.

### Preferences

```
  outgoing 724   ACCOUNT_PREFERENCES  AccountPreferencesEvent
```

Chat mode, bubble width, scroll speed, friend-notification setting. The client also writes these back:

```
  incoming 1149  SET_CHAT_PREFERENCES        SetChatPreferencesMessageComposer(mode, bubbleWidth, scrollSpeed)
  incoming 2634  SET_CHAT_STYLE_PREFERENCE   SetChatStylePreferenceComposer(styleId, fontSizeMode)
```

`useSessionInfo` expects the server to **echo `724` back** after a write — local state is re-hydrated from the roundtrip rather than trusted optimistically.

---

## 3. Navigator

**Complete — all 73 packets in `NAVIGATOR`, `NEW NAVIGATOR` and `ROOM DIRECTORY` are covered below.**

**Owner:** `src/hooks/navigator/useNavigator.ts` (all the event handlers) and `src/components/navigator/` (the composers). Room-info actions live in `views/NavigatorRoomInfoView.tsx`, creation in `views/NavigatorRoomCreatorView.tsx`.

The navigator is the largest single feature by packet count and the one where the protocol and the client diverge most. Nitro implements the **"new navigator"** — one generic search composer with a search code and filter string. The ~15 dedicated search composers from the older protocol are all still registered but **none of them is ever sent**. See §3.10.

### 3.1 Init

Opening the navigator window sends init exactly once, guarded by a `needsInit` flag:

```
  incoming 1590  NAVIGATOR_INIT     NewNavigatorInitComposer    (no payload)
```

`useNavigator` handles exactly four of the replies the protocol defines:

```
  outgoing 24    NAVIGATOR_METADATA   NavigatorMetaDataEvent
              int32 n × NavigatorTopLevelContext          the tabs
  outgoing 432   NAVIGATOR_SEARCHES   NavigatorSavedSearchesEvent
              int32 n × NavigatorSavedSearch              saved searches
  outgoing 3586  USER_HOME_ROOM       NavigatorHomeRoomEvent
              int32 homeRoomId, int32 roomIdToEnter
  outgoing 3708  NAVIGATOR_SEARCH     NavigatorSearchResultBlocksEvent
              NavigatorSearchResultSet                    the initial result set
```

`24` drives the tab strip; without it the navigator renders no tabs and no search is possible. Send it first.

⚠️ Three further init replies exist in the protocol and are registered, but **`useNavigator` does not listen for them**, so sending them has no effect:

- `outgoing 3937 NAVIGATOR_SETTINGS` `NewNavigatorPreferencesEvent` — `int32 windowX, windowY, windowWidth, windowHeight`, `boolean leftPanelHidden`, `int32 resultsMode`
- `outgoing 1754 NAVIGATOR_COLLAPSED` `NavigatorCollapsedCategoriesMessageEvent` — counted list of collapsed category codes
- `outgoing 1761 NAVIGATOR_LIFTED` `NavigatorLiftedRoomsEvent` — counted list of promoted rooms

Window geometry is persisted client-side instead. Do not spend time on these three.

### 3.2 Searching

```
  incoming 81    NAVIGATOR_SEARCH   NewNavigatorSearchComposer(code, data)
  outgoing 3708  NAVIGATOR_SEARCH   NavigatorSearchResultBlocksEvent
```

`code` is the search-code string from a `NavigatorTopLevelContext` (or a saved search); `data` is the free-text filter, usually empty.

`3708` returns a `NavigatorSearchResultSet`: the echoed search code, the filter text, and a list of `NavigatorSearchResultList` blocks. Each block has its own code, localised title, action, view mode, and a list of `RoomDataParser` entries. **One reply renders the entire results pane** — include every block you want shown, in display order.

Echo `code` and `data` back unchanged. The client matches the reply against the request it made and will render a mismatched set under the wrong tab.

### 3.3 Saved searches & view preferences

```
  incoming 1188  NAVIGATOR_SEARCH_SAVE          NavigatorAddSavedSearchComposer(code, data)
  incoming 2444  NAVIGATOR_DELETE_SAVED_SEARCH  NavigatorDeleteSavedSearchComposer(searchId)
```

Both are live. Reply to either with a refreshed `outgoing 432 NavigatorSavedSearchesEvent`; there is no dedicated ack.

Dormant, though registered — the collapse/expand and list-mode state is kept locally:

```
  incoming 3920  NAVIGATOR_SEARCH_CLOSE          NavigatorAddCollapsedCategoryMessageComposer(code)
  incoming 3449  NAVIGATOR_SEARCH_OPEN           NavigatorRemoveCollapsedCategoryMessageComposer(code)
  incoming 3681  NAVIGATOR_CATEGORY_LIST_MODE    NavigatorSetSearchCodeViewModeMessageComposer(category, listmode)
  incoming 1276  NAVIGATOR_SETTINGS_SAVE         SetNewNavigatorWindowPreferencesMessageComposer(x, y, width, height, leftSideOpen, mode)
```

### 3.4 Room information

The single most reused packet pair in the client — the navigator, the room-info window, the group views, chat history and the room-link widget all listen for `3042`.

```
  incoming 2603  GET_GUEST_ROOM   GetGuestRoomMessageComposer(roomId, enterRoom, forwardRoom)
  outgoing 3042  ROOM_INFO        GetGuestRoomResultEvent
```

`3042`'s wire order is easy to get wrong — the flags are **split around** the room data block:

```
boolean roomEnter
RoomDataParser data
boolean roomForward
boolean staffPick
boolean isGroupMember
boolean allInRoomMuted
RoomModerationSettings moderation
boolean canMute
int32 chatFloodSensitivity     incoming RoomChatSettings.fromFloodSensitivity(...)
boolean openingConnection
```

`enterRoom` / `forwardRoom` in the request are echoed back as `roomEnter` / `roomForward`; the client uses them to decide whether this reply should trigger an actual room entry or just populate a window.

```
  outgoing 3030  ROOM_INFO_UPDATED  RoomInfoUpdatedEvent   (int32 roomId)
```

A nudge, not a payload — the client re-requests `2603` for that room. Send it after any change to room settings, name, or staff-pick state.

### 3.5 Room creation

```
  incoming 354   ROOM_CREATE      CreateFlatMessageComposer(roomName, roomDesc, modelName, categoryId, maxVisitors, tradeType)
  outgoing 1712  ROOM_CREATED     FlatCreatedEvent(int32 roomId, string roomName)
```

On `1712` the client opens the new room's info window. Gating:

```
  incoming 2617  CAN_CREATE_ROOM        CanCreateRoomMessageComposer   (no payload)   — DORMANT
  outgoing 2831  CAN_CREATE_ROOM        CanCreateRoomEvent(int32 resultCode, int32 roomLimit)
  outgoing 853   CAN_CREATE_ROOM_EVENT  CanCreateRoomEventEvent(boolean canCreate, int32 errorCode)
  outgoing -1    NAVIGATOR_OPEN_ROOM_CREATOR  NavigatorOpenRoomCreatorEvent  ⚠️ placeholder opcode
```

`853` is handled by `useNavigator` and gates the create button. `2831` is registered but has no listener. `NavigatorOpenRoomCreatorEvent` would open the creator window, but its constant is the placeholder `-1` — unsendable.

The room categories that populate the creator's dropdowns:

```
  incoming 235   GET_USER_FLAT_CATS    GetUserFlatCatsMessageComposer   incoming outgoing 837  UserFlatCatsEvent
  incoming 3018  GET_USER_EVENT_CATS   GetUserEventCatsMessageComposer  incoming outgoing 1370 UserEventCatsEvent
```

Both replies are counted lists of `NavigatorCategoryDataParser` / `NavigatorEventCategoryDataParser`.

### 3.6 Room ownership actions

All live, all sent from `NavigatorRoomInfoView.tsx` unless noted:

```
  incoming 3169  ROOM_FAVORITE          AddFavouriteRoomMessageComposer(roomId)
  incoming 1654  ROOM_FAVORITE_REMOVE   DeleteFavouriteRoomMessageComposer(roomId)
  incoming 1817  USER_HOME_ROOM         UpdateHomeRoomMessageComposer(roomId)
  incoming 2985  ROOM_STAFF_PICK        ToggleStaffPickMessageComposer(roomId)
  incoming 407   ROOM_LIKE              RateFlatMessageComposer(rating)     from RoomToolsWidgetView
```

Favourites have two reply events, **neither of which has a listener** — the client updates its own list optimistically:

```
  outgoing 3081  USER_FAVORITE_ROOM        FavouriteChangedEvent(int32 flatId, boolean added)   — no listener
  outgoing 1055  USER_FAVORITE_ROOM_COUNT  FavouritesEvent(int32 limit, counted list)           — no listener
```

For staff pick and home room, confirm with `outgoing 3030 RoomInfoUpdatedEvent` so the info window refreshes. Rating is answered by `RoomRatingEvent`.

```
  incoming 260   ROOM_RIGHTS_REMOVE_OWN   RemoveOwnRoomRightsRoomMessageComposer(roomId)   — DORMANT
```

### 3.7 Chat filter words

```
  incoming 790   ROOM_FILTER_WORDS         GetCustomRoomFilterMessageComposer(roomId)
  incoming 1622  ROOM_FILTER_WORDS_MODIFY  UpdateRoomFilterMessageComposer(roomId, isAddingWord, word)
```

`1622` is sent from `RoomFilterWordsWidgetView`. `isAddingWord` is a boolean — one byte, `1` to add and `0` to remove. Both are answered by `RoomFilterSettingsMessageEvent` (see §13).

### 3.8 Room events / promotions

```
  incoming 2117  EDIT_ROOM_EVENT     EditEventMessageComposer(roomId, name, description)
  incoming 3402  CANCEL_ROOM_EVENT   CancelEventMessageComposer(roomId)   — DORMANT
  outgoing 2481  ROOM_EVENT          RoomEventEvent
  outgoing 894   ROOM_EVENT_CANCEL   RoomEventCancelEvent   (genuinely empty)   — no listener
```

`2117` is sent from the room-promote widget. `2481` is handled in both `useNavigator` and `useRoomPromote`.

⚠️ `EVENTS.MD` documents `2481` as having no payload. **It does have one** — the parser reads a full `RoomEventData` structure. This is one of the 33 mis-documented empty parsers; read `parser/navigator/RoomEventMessageParser.ts` directly. `894` by contrast really is empty.

### 3.9 Doorbell

The navigator owns the doorbell UI even though entry itself is a room-session flow (§4):

```
  outgoing 466   ROOM_DOORBELL           DoorbellMessageEvent(string userName)
  outgoing 1086  ROOM_DOORBELL_REJECTED  FlatAccessDeniedMessageEvent(string userName)
```

An **empty** `userName` in `466` means "your own knock is pending" and shows the waiting state; a non-empty name means someone is knocking at a room you control. The same distinction applies to `1086`. Getting this wrong makes the visitor see the owner's dialog.

### 3.10 Legacy search composers — all dormant

The old protocol had one composer per search type. Nitro sends **none** of them; everything goes through `incoming 81`. They remain registered, so a server may implement them, but nothing will ever arrive.

| Packet | Payload |
|---|---|
| `incoming 361` `MyRoomsSearchMessageComposer` | none |
| `incoming 2334` `MyFavouriteRoomsSearchMessageComposer` | none |
| `incoming 632` `MyRoomHistorySearchMessageComposer` | none |
| `incoming 2174` `MyFrequentRoomHistorySearchMessageComposer` | none |
| `incoming 1903` `MyFriendsRoomsSearchMessageComposer` | none |
| `incoming 1091` `MyRoomRightsSearchMessageComposer` | none |
| `incoming 2224` `MyGuildBasesSearchMessageComposer` | none |
| `incoming 184` `MyRecommendedRoomsMessageComposer` | none |
| `incoming 2517` `RoomsWhereMyFriendsAreSearchMessageComposer` | none |
| `incoming 2135` `RoomsWithHighestScoreSearchMessageComposer` | `int32` |
| `incoming 2857` `PopularRoomsSearchMessageComposer` | `string`, `int32` |
| `incoming 3487` `RoomTextSearchMessageComposer` | `string searchText` |
| `incoming 3744` `GuildBaseSearchMessageComposer` | `int32 groupId` |
| `incoming 1307` `CompetitionRoomsSearchMessageComposer` | `int32`, `int32` |
| `incoming 3942` `GET_OFFICIAL_ROOMS` `GetOfficialRoomsMessageComposer` | `int32` |
| `incoming 3214` `GET_POPULAR_ROOM_TAGS` `GetPopularRoomTagsMessageComposer` | none |
| `incoming -24` `GetCategoriesWithUserCountMessageComposer` | none — ⚠️ placeholder opcode |

Their reply events are equally dormant:

```
  outgoing 160   GUEST_ROOM_SEARCH_RESULT       GuestRoomSearchResultEvent
  outgoing 704   CATEGORIES_WITH_VISITOR_COUNT  CategoriesWithVisitorCountEvent
  outgoing 84    COMPETITION_ROOMS_DATA         CompetitionRoomsDataMessageEvent
```

`PopularRoomTagsResultEvent` is the documented reply to `3214`; it belongs to the same dormant group.

### 3.11 Room ads

Registered, never sent:

```
  incoming 1971  ROOM_AD_SEARCH             RoomAdSearchMessageComposer(int32, int32)
  incoming 759   ROOM_AD_EVENT_TAB_CLICKED  RoomAdEventTabAdClickedComposer(int32, string, int32)
  incoming 3729  ROOM_AD_EVENT_TAB_VIEWED   RoomAdEventTabViewedComposer   (no payload)
```

The catalog's room-ad purchase flow (`GetRoomAdPurchaseInfoComposer`, `PurchaseRoomAdMessageComposer`) is live and belongs to §7, not here.

### 3.12 Forwarding & external links

```
  incoming 584   CONVERT_GLOBAL_ROOM_ID   ConvertGlobalRoomIdMessageComposer(flatId)
  outgoing 3494  CONVERTED_ROOM_ID        ConvertedRoomIdEvent(string globalId, int32 convertedId)   — no listener
```

`584` is live: it is wired to the `LegacyExternalInterface` `OPENROOM` callback, so an external page asking the client to open a room by global id sends this. The reply event has no handler, so the forward must be driven by a room-entry packet (§4) rather than by `3494`.

Dormant forwarding composers:

```
  incoming 3427  FORWARD_TO_SOME_ROOM             ForwardToSomeRoomMessageComposer(string)
  incoming 3551  FORWARD_TO_RANDOM_PROMOTED_ROOM  ForwardToARandomPromotedRoomMessageComposer(string)
  incoming 3101  SET_ROOM_SESSION_TAGS            SetRoomSessionTagsMessageComposer(string, string)
  incoming 2045  ROOM_DIRECTORY_...OPEN_CONNECTION RoomNetworkOpenConnectionMessageComposer(int32, int32)
```

`ROOM_FORWARD` (`outgoing 3339 RoomForwardMessageEvent`) is handled in `useNavigator` and is the packet you actually use to push a client into a room. ⚠️ `EVENTS.MD` documents it as empty and gives no parser path; it really reads `int32 roomId` from the misspelled `RoomFowardParser`.

---

## 4. Room entry

The most sequenced flow in the protocol, and the one most likely to desync. Split across `../renderer/src/nitro/session/RoomSession.ts`, `session/handler/RoomSessionHandler.ts`, and `room/RoomMessageHandler.ts`.

### Phase 1 — ask to enter

```
  incoming 3234  ROOM_ENTER   OpenFlatConnectionMessageComposer(roomId, password, homeRoomId)
```

Now the server picks one of four outcomes:

```
  outgoing 611   ROOM_ENTER              OpenConnectionMessageEvent      accepted, proceed to phase 2
  outgoing 466   ROOM_DOORBELL           DoorbellMessageEvent            ringing, client shows "please wait"
  outgoing 1086  ROOM_DOORBELL_REJECTED  FlatAccessDeniedMessageEvent    turned away
  outgoing 2430  ROOM_ENTER_ERROR        CantConnectMessageEvent         full, banned, closed
```

For the doorbell path, the accept later arrives as `outgoing 2051 ROOM_DOORBELL_ACCEPTED` (`FlatAccessibleMessageEvent`) and the client re-enters on its own.

### Phase 2 — the model

```
  outgoing 2349  ROOM_MODEL_NAME   RoomReadyMessageEvent   (int32 roomId, string modelName)
```

This is the hinge of the whole flow. On receipt the client sets the room id, sets the model name — and **on the first room of the session only** replies:

```
  incoming 1901  FURNITURE_ALIASES   GetFurnitureAliasesMessageComposer
  outgoing 154   FURNITURE_ALIASES   FurnitureAliasesMessageEvent
```

`_initialConnection` guards this: on every later room entry the client does **not** re-request aliases. If your server waits for `1901` before continuing, the second room the user enters will hang forever. Push the rest of the room state unprompted.

Note `1901` is `FURNITURE_ALIASES` outgoing and `ROOM_SPECTATOR` incoming. Different directions, no conflict, but easy to mis-route.

### Phase 3 — push the room

After `2349`, send the room contents. The client does not request these:

```
  outgoing 1956  ROOM_PAINT        RoomPropertyMessageEvent          floor / wall / landscape
  outgoing 2260  ROOM_HEIGHT_MAP   HeightMapMessageEvent             the tile grid
  outgoing 2885  ROOM_MODEL        FloorHeightMapMessageEvent        the floor plan string
  outgoing 2104  FURNITURE_FLOOR   ObjectsMessageEvent               all floor furni
  outgoing 3379  ITEM_WALL         ItemsMessageEvent                 all wall items
  outgoing 996   UNIT              UsersMessageEvent                 all avatars, pets and bots present
  outgoing 2914  ROOM_INFO_OWNER   RoomEntryInfoMessageEvent         roomId + isOwner
  outgoing 2986  ROOM_THICKNESS    RoomVisualizationSettingsEvent    wall/floor thickness, hide walls
  outgoing 594   ROOM_SETTINGS_CHAT RoomChatSettingsMessageEvent     bubble mode, scroll, distance
```

The heightmap must arrive before the object lists — furni positions are resolved against the grid, and objects that land on an unknown tile are dropped silently.

`996` (`UNIT`) is also the packet for anyone entering later; it is a list, so a single-user arrival is just a list of one. Removal is `outgoing 3693 UNIT_REMOVE`.

### Leaving

```
  outgoing 3404  CLOSE_CONNECTION   CloseConnectionMessageEvent
```

Tears the session down. Also what you send to force a user out of a room.

---

## 5. Presence & chat

### Talking

```
  incoming 3034  UNIT_CHAT          ChatMessageComposer(message, styleId)
  incoming 1763  UNIT_CHAT_SHOUT    ShoutMessageComposer(message, styleId)
  incoming 1697  UNIT_CHAT_WHISPER  WhisperMessageComposer(recipient, message, styleId)
```

Nothing is echoed locally. The speaker sees their own message **only** because the server broadcasts it back:

```
  outgoing 311   UNIT_CHAT          ChatMessageEvent
  outgoing 1776  UNIT_CHAT_SHOUT    ShoutMessageEvent
  outgoing 3072  UNIT_CHAT_WHISPER  WhisperMessageEvent
```

Whispers go only to sender and recipient. If you drop the echo to the sender, the client looks broken.

Rate limiting:

```
  outgoing 3614  FLOOD_CONTROL      FloodControlMessageEvent   (int32 seconds)
```

Typing indicator:

```
  incoming 2106  UNIT_TYPING        StartTypingMessageComposer
  incoming 2718  UNIT_TYPING_STOP   CancelTypingMessageComposer
  outgoing 206   UNIT_TYPING        UserTypingMessageEvent     (userId, isTyping)
```

### Moving

```
  incoming 2364  UNIT_WALK          MoveAvatarMessageComposer(x, y)
  outgoing 2613  UNIT_STATUS        UserUpdateMessageEvent
```

`2613` carries the whole path-step update — position, direction, and the status map (`mv`, `sit`, `lay`, `flatctrl`). The client does no pathfinding of its own; it renders exactly the steps you send. Movement is entirely server-authoritative.

### Expressing

```
  incoming 48    UNIT_DANCE         DanceMessageComposer(styleId)     outgoing 2217 DanceMessageEvent
  incoming 2912  AVATAR_EXPRESSION  AvatarExpressionMessageComposer   outgoing 1036 ExpressionMessageEvent
```

---

## 6. Furniture

```
  incoming 1974  FURNITURE_PLACE          PlaceObjectMessageComposer
  outgoing 368   FURNITURE_FLOOR_ADD      ObjectAddMessageEvent       floor item appeared
  outgoing 3733  ITEM_WALL_ADD            ItemAddMessageEvent         wall item appeared

  incoming 1482  FURNITURE_FLOOR_UPDATE   MoveObjectMessageComposer(id, x, y, direction)
  outgoing 114   FURNITURE_FLOOR_UPDATE   ObjectUpdateMessageEvent

  incoming 1919  FURNITURE_PICKUP         PickupObjectMessageComposer
  outgoing 1916  FURNITURE_FLOOR_REMOVE   ObjectRemoveMessageEvent

  incoming 3353  USE_FURNITURE            UseFurnitureMessageComposer(itemId, state)
  outgoing 2329  FURNITURE_DATA           ObjectDataUpdateMessageEvent
```

The pattern throughout: the client sends intent and changes nothing locally. Every visible change comes from the broadcast. Placement that you reject needs no error packet — simply not sending the add event leaves the item in inventory, which is the correct outcome.

Placing from inventory also triggers `outgoing FurniListRemoveEvent` so the inventory window stays in sync.

---

## 7. Catalog & purchasing

**Owner:** `src/hooks/catalog/useCatalog.ts`.

```
  incoming 2232  GET_CATALOG_INDEX  GetCatalogIndexComposer(catalogType)
  outgoing 3666  CATALOG_PAGE_LIST  CatalogIndexMessageEvent
```

`3666` returns the page tree as nested `NodeData` — each node carries visibility, icon, page id, and its children, recursively. The client renders the whole left-hand tree from this one packet.

```
  incoming 2093  GET_CATALOG_PAGE   GetCatalogPageComposer(pageId, offerId, catalogType)
  outgoing 1660  CATALOG_PAGE       CatalogPageMessageEvent
```

`1660` is the big one: page id, catalog type, layout code, localization block, the offer list, and an optional trailing front-page block. The **layout code is a string the client switches on** to pick a React layout component — send a code the client does not know and the page renders empty. Look at `src/components/catalog/views/page/layout/` for the supported set.

Buying:

```
  incoming 1706  CATALOG_PURCHASE   PurchaseFromCatalogComposer(pageId, offerId, extraData, quantity)
```

Exactly one of:

```
  outgoing 1570  CATALOG_PURCHASE_OK           PurchaseOKMessageEvent
  outgoing 1029  CATALOG_PURCHASE_ERROR        PurchaseErrorMessageEvent
  outgoing 2493  CATALOG_PURCHASE_NOT_ALLOWED  PurchaseNotAllowedMessageEvent
  outgoing 1038  NOT_ENOUGH_BALANCE            NotEnoughBalanceMessageEvent
  outgoing 533   LIMITED_SOLD_OUT              LimitedEditionSoldOutEvent
```

The purchase button stays in a spinner until one of these arrives — there is no timeout. Always answer.

After a successful purchase you must also push the consequences yourself: updated balance (`3642` / `509`) and the new inventory item (`3151 FurniListAddOrUpdateEvent`). `1570` alone updates nothing but the confirmation dialog.

---

## 8. Inventory

Four independent inventories, each with the same request/reply shape:

```
  incoming 41    USER_FURNITURE   RequestFurniInventoryComposer   outgoing 2694  FurniListEvent
  incoming 3891  USER_PETS        GetPetInventoryComposer         outgoing 1200  PetInventoryEvent
  incoming 3148  USER_BOTS        GetBotInventoryComposer         outgoing 682   BotInventoryEvent
  incoming 770   USER_BADGES      GetBadgesComposer               outgoing 2748  BadgesEvent
```

The furni list is **fragmented**: `2694` carries a total-fragments count and an index, and the client accumulates until it has them all. Send one fragment with `totalFragments = 1, fragmentNumber = 0` if you do not need to page.

Incremental updates:

```
  outgoing 3151  USER_FURNITURE_ADD      FurniListAddOrUpdateEvent
  outgoing 1156  USER_FURNITURE_REMOVE   FurniListRemoveEvent
  outgoing 1856  USER_FURNITURE_REFRESH  FurniListInvalidateEvent   discard cache and re-request
```

Unseen tracking, which drives the orange dots on the toolbar:

```
  outgoing 3059  UNSEEN_ITEMS               UnseenItemsEvent
  incoming 3771  UNSEEN_RESET_ITEMS         ResetUnseenItemIdsComposer(category, ...itemIds)
  incoming 699   UNSEEN_RESET_CATEGORY      ResetUnseenItemsComposer(category)
```

Badges are split between owned and the (max five) equipped:

```
  incoming 2764  USER_BADGES_CURRENT_UPDATE   SetActivatedBadgesComposer
```

---

## 9. Trading

A strict state machine. `src/hooks/inventory/useInventoryTrade.ts` holds the client half; the states are `READY incoming RUNNING incoming COUNTDOWN incoming CONFIRMING incoming CONFIRMED`.

```
  incoming 1865  TRADE              OpenTradingComposer(userId)
  outgoing 953   TRADE_OPEN         TradingOpenEvent(userOne, canTradeOne, userTwo, canTradeTwo)
  outgoing 2855  TRADE_OPEN_FAILED  TradeOpenFailedEvent
```

Also possible instead of `953`: `TradingOtherNotAllowedEvent`, `TradingYouAreNotAllowedEvent`.

Both sides then edit their offer. Every change re-broadcasts the **entire** list to both parties:

```
  incoming 2177  TRADE_ITEM         AddItemToTradeComposer(itemId)
  incoming 3370  TRADE_ITEMS        AddItemsToTradeComposer(count, ...itemIds)
  incoming 573   TRADE_ITEM_REMOVE  RemoveItemFromTradeComposer(itemId)
  outgoing 2275  TRADE_LIST_ITEM    TradingItemListEvent
```

`2275` resets both accept flags. That is deliberate: changing your offer un-accepts the trade for both sides, and the client relies on the server enforcing it.

```
  incoming 490   TRADE_ACCEPT       AcceptTradingComposer
  incoming 1030  TRADE_UNACCEPT     UnacceptTradingComposer
  outgoing 560   TRADE_ACCEPTED     TradingAcceptEvent(userId, accepted)
```

When both have accepted:

```
  outgoing 3138  TRADE_CONFIRMATION  TradingConfirmationEvent   incoming client enters COUNTDOWN
  incoming 2662  TRADE_CONFIRM       ConfirmAcceptTradingComposer
  outgoing 1070  TRADE_COMPLETED     TradingCompletedEvent
```

Aborting at any point:

```
  incoming 3639  TRADE_CLOSE          CloseTradingComposer
  incoming 1217  TRADE_CANCEL          ConfirmDeclineTradingComposer
  outgoing 699   TRADE_CLOSED         TradingCloseEvent
  outgoing 3556  TRADE_NOT_OPEN       TradingNotOpenEvent
```

After `1070` push both users a fresh inventory delta — the trade window closes but the inventory does not refresh itself.

---

## 10. Friends & messenger

**Owner:** `src/hooks/friends/useFriends.ts`, `useMessenger.ts`.

```
  incoming 3278  MESSENGER_INIT     MessengerInitMessageComposer
  outgoing 1590  MESSENGER_INIT     MessengerInitEvent     friend list capacity and config
```

Note `1590` is `MESSENGER_INIT` incoming and `NAVIGATOR_INIT` outgoing. Same number, opposite directions.

```
  incoming 3679  FRIEND_LIST_UPDATE   FriendListUpdateMessageComposer
  outgoing 2641  MESSENGER_FRIENDS    FriendListFragmentMessageEvent   fragmented, like furni
  outgoing 3611  MESSENGER_UPDATE     FriendListUpdateEvent            deltas: added / removed / online
```

Requests:

```
  incoming 3797  GET_FRIEND_REQUESTS  GetFriendRequestsMessageComposer  outgoing 1120  FriendRequestsEvent
  incoming 1     REQUEST_FRIEND       RequestFriendMessageComposer      outgoing 1860  NewFriendRequestEvent (to the target)
  incoming 1772  ACCEPT_FRIEND        AcceptFriendMessageComposer(count, ...userIds)
  incoming 2778  DECLINE_FRIEND       DeclineFriendMessageComposer(removeAll, count, ...userIds)
```

`REQUEST_FRIEND` really is opcode `1`.

Messaging:

```
  incoming 3357  MESSENGER_CHAT           SendMsgMessageComposer(userId, message)
  outgoing 468   MESSENGER_CHAT           NewConsoleMessageEvent
  outgoing 358   MESSENGER_MESSAGE_ERROR  MessengerErrorEvent
```

As with room chat, the sender sees their message only via the `468` echo.

Room invites:

```
  incoming 617   SEND_ROOM_INVITE   SendRoomInviteMessageComposer(count, ...userIds, message)
  outgoing 3194  MESSENGER_INVITE   RoomInviteEvent
```

`AcceptFriendMessageComposer`, `DeclineFriendMessageComposer` and `SendRoomInviteMessageComposer` all flatten a user-id array with an explicit count in front. The count is a **single int32**, not part of the array — see [Part D](#part-d--known-traps).

---

## 11. User profile & respects

```
  incoming 847   USER_PROFILE   GetExtendedProfileMessageComposer(userId, flag)
  outgoing 1918  USER_PROFILE   ExtendedProfileMessageEvent
```

`1918` carries the whole profile card: user data, group memberships, friend count, whether a request is pending, and account age.

```
  incoming 3219  MESSENGER_RELATIONSHIPS  UserRelationshipsComposer(userId)
  outgoing 3360  MESSENGER_RELATIONSHIPS  RelationshipStatusInfoEvent
  incoming 1773  SET_RELATIONSHIP_STATUS  SetRelationshipStatusMessageComposer(userId, relationshipStatus)
```

```
  incoming 3770  USER_RESPECT   RespectUserMessageComposer(userId)
  outgoing 2686  USER_RESPECT   RespectNotificationMessageEvent
```

The client decrements its local respect counter optimistically from the value in `UserObjectEvent`, so keep your server-side count aligned or the button re-enables at the wrong time.

---

## 12. Avatar & wardrobe

```
  incoming 3339  USER_FIGURE   UpdateFigureDataMessageComposer(gender, figure)
  outgoing 132   USER_FIGURE   FigureUpdateEvent
```

`3339` is `USER_FIGURE` outgoing and `ROOM_FORWARD` incoming — another same-number, opposite-direction pair.

If the user is in a room, also broadcast `UserChangeMessageEvent` so everyone else re-renders the avatar.

```
  incoming 2210  GET_WARDROBE           GetWardrobeMessageComposer(pageId)
  incoming 116   SAVE_WARDROBE_OUTFIT   SaveWardrobeOutfitMessageComposer(slotId, look, gender)
```

⚠️ The reply to `2210` is `WardrobeMessageEvent`, whose opcode constant `USER_OUTFITS` is still the placeholder `-1`. **The wardrobe cannot currently receive its data** — the event is registered under a negative id that no packet can match. Fix `IncomingHeader.USER_OUTFITS` before building this server-side.

---

## 13. Room settings & ownership

```
  incoming 2603  GET_GUEST_ROOM   GetGuestRoomMessageComposer(roomId, enterRoom, forwardRoom)
  outgoing 3042  ROOM_INFO        GetGuestRoomResultEvent
```

`3042` is used everywhere, not just settings — the navigator, the room info window, and the group views all listen for it.

```
  incoming 256   ROOM_SETTINGS       GetRoomSettingsMessageComposer(roomId)
  outgoing 791   ROOM_SETTINGS       RoomSettingsDataEvent
  incoming 725   ROOM_SETTINGS_SAVE  SaveRoomSettingsMessageComposer(...)
  outgoing 1783  ROOM_SETTINGS_SAVE  RoomSettingsSavedEvent
  outgoing 3030  ROOM_INFO_UPDATED   RoomInfoUpdatedEvent
  outgoing RoomSettingsSaveErrorEvent  on validation failure
```

After a successful save, send `1783` **and** `3030` — the first closes the dialog, the second refreshes the navigator entry.

Rights:

```
  incoming 342   ROOM_RIGHTS_LIST        GetFlatControllersMessageComposer(roomId)  outgoing FlatControllersEvent
  incoming 373   ROOM_RIGHTS_GIVE        AssignRightsMessageComposer               outgoing FlatControllerAddedEvent
  incoming 3444  ROOM_RIGHTS_REMOVE      RemoveRightsMessageComposer(count, ...userIds)
  incoming 159   ROOM_RIGHTS_REMOVE_ALL  RemoveAllRightsMessageComposer(roomId)
```

---

## 14. Groups

```
  incoming 1683  GROUP_INFO          GetHabboGroupDetailsMessageComposer(groupId, flag)
  outgoing 2847  GROUP_INFO          HabboGroupDetailsMessageEvent
  incoming 1337  GROUP_MEMBERS       GetGuildMembersMessageComposer(...)
  outgoing 403   GROUP_MEMBERS       GuildMembersMessageEvent
```

Creation is a two-step wizard:

```
  incoming 2989  GROUP_CREATE_OPTIONS  GetGuildCreationInfoMessageComposer   outgoing GuildCreationInfoMessageEvent
  incoming 207   GROUP_BUY           CreateGuildMessageComposer(name, description, roomId, colorA, colorB, badgeLen, ...badge)
  outgoing GuildCreatedMessageEvent  /  outgoing GuildEditFailedMessageEvent
```

Membership management (`ApproveMembershipRequestMessageComposer`, `KickMemberMessageComposer`, `AddAdminRightsToMemberMessageComposer`, …) all reply with either a refreshed `GuildMembersMessageEvent` or `GuildMemberMgmtFailedMessageEvent`.

`CreateGuildMessageComposer` and `UpdateGuildBadgeMessageComposer` use the count-then-array pattern for badge parts.

---

## 15. Wired

```
  incoming 1869  WIRED_OPEN   OpenMessageComposer(furniId)
```

The server replies with whichever variant matches the furni:

```
  outgoing 1265  WIRED_TRIGGER    WiredFurniTriggerEvent
  outgoing 2552  WIRED_ACTION     WiredFurniActionEvent
  outgoing 2250  WIRED_CONDITION  WiredFurniConditionEvent
  outgoing 2635  WIRED_OPEN       OpenEvent
```

Saving:

```
  incoming 3953  WIRED_TRIGGER_SAVE    UpdateTriggerMessageComposer
  incoming 2197  WIRED_ACTION_SAVE     UpdateActionMessageComposer
  incoming 767   WIRED_CONDITION_SAVE  UpdateConditionMessageComposer
  outgoing 1192  WIRED_SAVE            WiredSaveSuccessEvent
```

These save composers are the **worst offenders for array flattening** — `UpdateActionMessageComposer` alone carries six separate count-then-array blocks (int params, stuff ids, furni sources, user sources, variable ids, and a second stuff-id list). Read the Part 1 table in `EVENTS.MD` field by field. Every count is one int32; the array that follows has no length prefix of its own.

---

## 16. Moderation

Gated on `UserRightsMessageEvent` security level. **Owner:** `src/components/mod-tools/`.

```
  incoming 3230  MOD_TOOL_USER_INFO   GetModeratorUserInfoMessageComposer(userId)   outgoing 2866 ModeratorUserInfoEvent
  incoming 1504  MODTOOL_REQUEST_ROOM_INFO  GetModeratorRoomInfoMessageComposer(roomId)   outgoing 3129 ModeratorRoomInfoEvent
  incoming 1346  MODTOOL_REQUEST_ROOM_CHATLOG  GetRoomChatlogMessageComposer   outgoing RoomChatlogEvent
  incoming 1686  MODTOOL_REQUEST_USER_CHATLOG  GetUserChatlogMessageComposer   outgoing UserChatlogEvent
  incoming 903   MODTOOL_REQUEST_USER_ROOMS  GetRoomVisitsMessageComposer    outgoing RoomVisitsEvent
```

Actions — `ModAlertMessageComposer`, `ModKickMessageComposer`, `ModBanMessageComposer`, `ModMuteMessageComposer`, `ModTradingLockMessageComposer`, `ModeratorActionMessageComposer` — are fire-and-forget from the client's perspective. The target sees the effect through `ModeratorMessageEvent`, `ModeratorCautionEvent`, or `UserBannedMessageEvent`.

Ticket queue:

```
  incoming 3400  PICK_ISSUES             PickIssuesMessageComposer(count, ...issueIds, retry, retryCount, message)
  incoming 3986  CLOSE_ISSUES            CloseIssuesMessageComposer(resolutionType, count, ...issueIds)
  incoming 3977  RELEASE_ISSUES          ReleaseIssuesMessageComposer(count, ...issueIds)
  outgoing IssueInfoMessageEvent / IssueDeletedMessageEvent / IssuePickFailedMessageEvent
```

All three use count-then-array.

---

## 17. Help / call for help

```
  incoming 732   CALL_FOR_HELP               CallForHelpMessageComposer(message, topicIndex, reportedUserId, reportedRoomId, chatEntries.length / 2, ...chatEntries)
  outgoing 2631  CFH_RESULT_MESSAGE          CallForHelpResultMessageEvent
```

The count here is `chatEntries.length / 2` because the array is flattened pairs — one int32, then the interleaved entries.

```
  incoming 92    GET_PENDING_CALLS_FOR_HELP  GetPendingCallsForHelpMessageComposer
  outgoing 2987  CFH_PENDING_CALLS           CallForHelpPendingCallsMessageEvent
```

⚠️ `EVENTS.MD` currently documents `2987` (the reply) as having **no payload**. It does: `int32 count`, then n × (string callId, string timeStamp, string message). The same mis-documentation affects `CallForHelpReplyMessageEvent` and the four `ChatReviewSession*` events. Read the parser sources directly until the doc is regenerated.

---

## 18. Notifications

`src/hooks/notification/useNotification.ts` listens to 21 events and sends nothing. These are all server-initiated; there is no request half.

```
  outgoing HabboBroadcastMessageEvent       hotel-wide announcement
  outgoing MOTDNotificationEvent            message of the day
  outgoing NotificationDialogMessageEvent   generic keyed dialog
  outgoing CustomUserNotificationMessageEvent
  outgoing HabboAchievementNotificationMessageEvent
  outgoing ModeratorMessageEvent / ModeratorCautionEvent
  outgoing UserBannedMessageEvent
  outgoing InfoHotelClosingMessageEvent / InfoHotelClosedMessageEvent / LoginFailedHotelClosedMessageEvent
  outgoing MaintenanceStatusMessageEvent
  outgoing PetLevelNotificationEvent / PetReceivedMessageEvent
  outgoing RespectNotificationMessageEvent
  outgoing ClubGiftNotificationEvent
```

`NotificationDialogMessageEvent` is the general-purpose one: it takes a localization key and a parameter map, and the client resolves the display text from its own translation files. Sending an unknown key renders the raw key.

---

# Part C — Implementing a new flow

1. **Find the packets.** Search `EVENTS.MD` for the feature name. Part 1 gives you what the client sends, Part 2 what it expects back.
2. **Confirm the client actually uses them.** A packet existing in the protocol does not mean the UI wires it up. `grep -rn "NewComposerName" src/` in this repo — if nothing comes back, no UI path sends it.
3. **Check registration.** The class must appear in `../renderer/src/nitro/communication/NitroMessages.ts`. Unregistered composers cannot be sent; unregistered events are never dispatched.
4. **Check the opcode is real.** A negative value in `OutgoingHeader` / `IncomingHeader` is a placeholder, not an opcode. 20 outgoing and 27 incoming constants are still negative.
5. **Write the handler in the shared hook**, not the component, and use `useBetween` so the subscription is single.
6. **Send the consequences, not just the acknowledgement.** The client is almost entirely server-authoritative: it updates its UI from broadcasts, not from its own optimistic guesses. A purchase needs the balance and the inventory delta, not only `PurchaseOKMessageEvent`.

---

# Part D — Known traps

**Array flattening.** A `number[]` spread into a composer's `_data` writes n × int32 with **no length prefix**. Any count in front of it is a separate explicit field. This is the single most common source of desync, and it appears in `AcceptFriendMessageComposer`, `SendRoomInviteMessageComposer`, `PollAnswerComposer`, `CreateGuildMessageComposer`, all six wired save composers, and every mod-tool issue composer.

> ⚠️ `EVENTS.MD` currently mislabels the wire type of these count fields — 51 rows across 21 composers show the count as `int32 × n` or `string × n`, inheriting the array's type. **The count is always a single `int32`.**

**Opcodes are direction-scoped.** `1590`, `1901`, `3339` and `4000` each mean different things inbound and outbound. Key your tables by direction.

**Placeholder opcodes.** 20 outgoing and 27 incoming constants hold negative values. `WardrobeMessageEvent` (`USER_OUTFITS`) is the one most likely to bite — the wardrobe request has no working reply.

**`UserSettingsOldChatComposer` is unsendable.** It is imported into `NitroMessages.ts` and used at `src/components/user-settings/UserSettingsView.tsx:31`, but never registered with `_composers.set(...)`. The opcode `USER_SETTINGS_OLD_CHAT = 1149` exists. Toggling that setting currently sends nothing.

**Parsers documented as empty that are not.** 33 serverincomingclient entries in `EVENTS.MD` claim "empty — header only, no payload read" but read a real payload. They cluster in group, help/chat-review, pet, poll, sound, and youtube, plus `ROOM_FORWARD` (whose parser class is misspelled `RoomFowardParser`). Trust the parser source over the doc for these.

**`bytesAvailable` guards mean optional trailing blocks.** A parser that checks `wrapper.bytesAvailable` before reading is tolerating older servers that omit that block. You may leave it off; you may not send a partial one.
