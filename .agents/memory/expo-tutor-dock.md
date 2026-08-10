---
name: Expo tutor dock
description: Layout constraint for chat screens using Expo Router, FlatList, and horizontal prompt chips.
---

For Expo chat screens, a horizontal prompt `ScrollView` can unexpectedly expand in the web preview and push the composer below the viewport. Keep the prompt row explicitly sized and position the web composer dock above the tab bar; leave the message list room for that dock.

**Why:** The chat rendered correctly on native-like layouts but the web preview hid the input when the horizontal prompt strip was allowed to participate in normal vertical sizing.

**How to apply:** When changing the tutor/chat UI, preserve the compact prompt row and dedicated bottom dock pattern, and verify both `/tutor/` and the home tab after layout edits.