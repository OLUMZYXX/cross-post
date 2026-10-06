import { View, Text, TouchableOpacity, ScrollView, Modal, Image, ActivityIndicator, Linking, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "../constants/theme";
import { TIKTOK_MUSIC_POLICY_URL, TIKTOK_BRANDED_POLICY_URL } from "../constants/tiktok";
import TikTokPrivacyPicker from "./TikTokPrivacyPicker";
import TikTokToggleRow from "./TikTokToggleRow";
import TikTokDisclosure from "./TikTokDisclosure";

function CreatorHeader({ creator }) {
  return (
    <View className="flex-row items-center mb-6">
      {creator.avatarUrl ? (
        <Image source={{ uri: creator.avatarUrl }} className="w-11 h-11 rounded-full" />
      ) : (
        <View className="w-11 h-11 rounded-full bg-paper-deep items-center justify-center">
          <Ionicons name="logo-tiktok" size={20} color={getColors().ink} />
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-ink-muted text-[11px]">Posting to TikTok as</Text>
        <Text className="text-ink text-base font-sans-bold" numberOfLines={1}>{creator.nickname}</Text>
      </View>
    </View>
  );
}

function Consent({ brandedContent }) {
  const link = (url) => () => Linking.openURL(url);
  return (
    <Text className="text-ink-muted text-[11px] leading-4 mb-4">
      By posting, you agree to TikTok's{" "}
      {brandedContent ? (
        <>
          <Text className="text-ink font-sans-semibold underline" onPress={link(TIKTOK_BRANDED_POLICY_URL)}>Branded Content Policy</Text>
          {" and "}
        </>
      ) : null}
      <Text className="text-ink font-sans-semibold underline" onPress={link(TIKTOK_MUSIC_POLICY_URL)}>Music Usage Confirmation</Text>.
      {" "}It may take a few minutes for the post to appear on your profile.
    </Text>
  );
}

function SheetBody({ tiktok }) {
  const { creator, settings, update, isVideo } = tiktok;
  return (
    <>
      <CreatorHeader creator={creator} />
      <TikTokPrivacyPicker
        options={creator.privacyOptions}
        value={settings.privacyLevel}
        brandedContent={settings.brandedContent}
        onChange={(privacyLevel) => update({ privacyLevel })}
      />
      <Text className="text-ink-muted text-[11px] font-sans-semibold tracking-[1.5px] mb-3">ALLOW USERS TO</Text>
      <View className="bg-paper rounded-2xl border border-rule overflow-hidden mb-6">
        <TikTokToggleRow label="Comment" value={settings.allowComment} disabled={creator.commentDisabled} onChange={(allowComment) => update({ allowComment })} />
        {isVideo ? (
          <>
            <TikTokToggleRow bordered label="Duet" value={settings.allowDuet} disabled={creator.duetDisabled} onChange={(allowDuet) => update({ allowDuet })} />
            <TikTokToggleRow bordered label="Stitch" value={settings.allowStitch} disabled={creator.stitchDisabled} onChange={(allowStitch) => update({ allowStitch })} />
          </>
        ) : null}
      </View>
      <TikTokDisclosure settings={settings} onChange={update} />
    </>
  );
}

export default function TikTokPostSheet({ tiktok }) {
  const ready = Boolean(tiktok.creator);
  const { height } = useWindowDimensions();

  return (
    <Modal visible={tiktok.visible} transparent animationType="slide" onRequestClose={tiktok.close}>
      <TouchableOpacity activeOpacity={1} onPress={tiktok.close} className="flex-1 bg-ink/60 justify-end">
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View className="bg-paper-light rounded-t-3xl px-6 pt-5 pb-10 border-t border-rule" style={{ maxHeight: height * 0.9 }}>
            <View className="w-10 h-1 bg-paper-deep rounded-full self-center mb-5" />
            <Text className="text-ink text-lg font-serif-bold mb-5">TikTok post settings</Text>

            {tiktok.loadError ? (
              <View className="py-8 items-center">
                <Text className="text-terracotta text-sm text-center mb-4">{tiktok.loadError}</Text>
                <TouchableOpacity onPress={tiktok.retry} className="bg-paper-deep px-5 py-3 rounded-xl">
                  <Text className="text-ink font-sans-semibold">Try again</Text>
                </TouchableOpacity>
              </View>
            ) : !ready ? (
              <View className="py-12 items-center">
                <ActivityIndicator color={getColors().terracotta} />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <SheetBody tiktok={tiktok} />
                <Consent brandedContent={tiktok.settings.brandedContent} />
                {tiktok.problem ? <Text className="text-terracotta text-xs mb-3">{tiktok.problem}</Text> : null}
                <TouchableOpacity
                  onPress={tiktok.confirm}
                  disabled={Boolean(tiktok.problem)}
                  className={`py-3.5 rounded-xl items-center ${tiktok.problem ? "bg-paper-deep" : "bg-terracotta"}`}
                >
                  <Text className={`font-sans-bold text-sm ${tiktok.problem ? "text-ink-muted" : "text-paper-light"}`}>Continue</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
