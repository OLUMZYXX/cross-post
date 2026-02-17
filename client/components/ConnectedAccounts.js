import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "./Toast";
import { platformAPI } from "../services/api";

const PLATFORM_STYLES = {
  Twitter: { icon: "logo-twitter", bg: "bg-blue-500/20", color: "#3b82f6" },
  Instagram: { icon: "logo-instagram", bg: "bg-pink-500/20", color: "#ec4899" },
  LinkedIn: { icon: "logo-linkedin", bg: "bg-blue-600/20", color: "#2563eb" },
  Facebook: { icon: "logo-facebook", bg: "bg-blue-700/20", color: "#1d4ed8" },
  TikTok: { icon: "logo-tiktok", bg: "bg-gray-800", color: "#e5e7eb" },
  YouTube: { icon: "logo-youtube", bg: "bg-red-500/20", color: "#ef4444" },
  Reddit: { icon: "logo-reddit", bg: "bg-orange-500/20", color: "#f97316" },
};

export default function ConnectedAccounts({ onBack, onOpenConnectModal }) {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagePickerVisible, setPagePickerVisible] = useState(false);
  const [fbPages, setFbPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [switchingPageId, setSwitchingPageId] = useState(null);
  const [fbLoginModalVisible, setFbLoginModalVisible] = useState(false);
  const [fbLoginErrorMessage, setFbLoginErrorMessage] = useState("");
  const { showToast } = useToast();

  const fetchPlatforms = useCallback(async () => {
    try {
      const { data } = await platformAPI.list();
      setPlatforms(data.platforms);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handleDisconnect = async (platform) => {
    try {
      await platformAPI.disconnect(platform._id);
      setPlatforms((prev) => prev.filter((p) => p._id !== platform._id));
      showToast({ type: "success", title: `${platform.name} disconnected` });
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    }
  };

  const handleOpenPagePicker = async () => {
    setPagePickerVisible(true);
    setLoadingPages(true);
    try {
      const { data } = await platformAPI.listFacebookPages();
      setFbPages(data.pages);
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
      const msg = err?.message || "Failed to fetch Facebook pages";
      setFbLoginErrorMessage(msg);
      setFbLoginModalVisible(true);
      setPagePickerVisible(false);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleFacebookReauth = async () => {
    try {
      const { data } = await platformAPI.initiateFacebookAuth(true);
      await Linking.openURL(data.authUrl);
      setFbLoginModalVisible(false);
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    }
  };

  const handleFacebookDebug = async () => {
    try {
      const { data } = await platformAPI.getFacebookDebug();
      const accountsCount = data.accounts?.data?.length || 0;
      const isValid = data.debug?.data?.is_valid ? "valid" : "invalid";
      const scopes = (data.debug?.data?.scopes || []).join(", ");
      alert(
        `Saved pageId: ${data.platform.pageId || "none"}\nPages returned by Graph API: ${accountsCount}\nToken: ${isValid}\nScopes: ${scopes}`,
      );
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    }
  };

  const handleSelectPage = async (pageId) => {
    setSwitchingPageId(pageId);
    try {
      const { data } = await platformAPI.selectFacebookPage(pageId);
      showToast({
        type: "success",
        title: "Page switched",
        message: `Now connected to "${data.pageName}"`,
      });
      setPagePickerVisible(false);
      fetchPlatforms();
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    } finally {
      setSwitchingPageId(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-950 px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">
          Connected Accounts
        </Text>
        <Text className="text-gray-500 text-sm">{platforms.length}</Text>
      </View>

      {loading ? (
        <View className="items-center py-12">
          <ActivityIndicator color="#4ade80" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {platforms.map((platform) => {
            const style = PLATFORM_STYLES[platform.name] || {};
            return (
              <View
                key={platform._id}
                className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3"
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-11 h-11 rounded-full ${style.bg || "bg-gray-700"} items-center justify-center mr-3`}
                  >
                    <Ionicons
                      name={style.icon || "globe-outline"}
                      size={22}
                      color={style.color || "#fff"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-white font-bold text-sm"
                      numberOfLines={1}
                    >
                      {platform.platformUsername || platform.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {platform.name}
                    </Text>
                    {platform.name === "Facebook" ? (
                      <Text className="text-gray-400 text-xs mt-1">
                        {platform.pageId
                          ? "Page connected"
                          : "No Page connected — create/link a Facebook Page to publish posts"}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDisconnect(platform)}
                    className="bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20"
                  >
                    <Text className="text-red-400 text-xs font-medium">
                      Disconnect
                    </Text>
                  </TouchableOpacity>
                </View>

                {platform.name === "Facebook" && (
                  <TouchableOpacity
                    onPress={handleOpenPagePicker}
                    className="mt-3 bg-blue-500/10 py-2.5 rounded-lg border border-blue-500/20 flex-row items-center justify-center"
                  >
                    <Ionicons
                      name="swap-horizontal"
                      size={16}
                      color="#3b82f6"
                    />
                    <Text className="text-blue-400 text-xs font-medium ml-2">
                      Switch Page
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            onPress={onOpenConnectModal}
            className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 mb-3 flex-row items-center"
            style={{ borderStyle: "dashed" }}
          >
            <View className="w-11 h-11 rounded-full bg-green-500/20 items-center justify-center mr-3">
              <Ionicons name="add" size={22} color="#4ade80" />
            </View>
            <Text className="text-green-400 font-medium">Add New Account</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={pagePickerVisible}
        onRequestClose={() => setPagePickerVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-900 rounded-3xl p-6 w-80 max-h-96">
            <Text className="text-white text-lg font-bold mb-2">
              Select Facebook Page
            </Text>
            <Text className="text-gray-400 text-xs mb-4">
              Choose which page to post to
            </Text>

            {loadingPages ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#3b82f6" />
              </View>
            ) : fbPages.length === 0 ? (
              <View className="py-6 px-2 items-center">
                <Text className="text-gray-400 text-sm text-center mb-4">
                  We couldn't find any Facebook Pages on your account. Make sure
                  you logged into the Facebook account that manages a Page, or
                  create a new Page and then try again.
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL("https://www.facebook.com/pages/create")
                  }
                  className="bg-blue-500 py-2 px-3 rounded-xl"
                >
                  <Text className="text-white text-sm">
                    Create a Facebook Page
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {fbPages.map((page) => (
                  <TouchableOpacity
                    key={page.id}
                    onPress={() => handleSelectPage(page.id)}
                    disabled={switchingPageId !== null}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      page.isSelected
                        ? "bg-blue-500/20 border border-blue-500/30"
                        : "bg-gray-800/50"
                    }`}
                  >
                    <View className="w-10 h-10 rounded-full bg-blue-700/20 items-center justify-center mr-3">
                      <Ionicons
                        name="logo-facebook"
                        size={20}
                        color="#1d4ed8"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-white font-medium text-sm"
                        numberOfLines={1}
                      >
                        {page.name}
                      </Text>
                      {page.category ? (
                        <Text className="text-gray-500 text-xs">
                          {page.category}
                        </Text>
                      ) : null}
                    </View>
                    {switchingPageId === page.id ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : page.isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#3b82f6"
                      />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={() => setPagePickerVisible(false)}
              className="bg-gray-800 py-3 rounded-xl mt-4"
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={fbLoginModalVisible}
        onRequestClose={() => setFbLoginModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-gray-900 rounded-3xl p-6 w-80">
            <Text className="text-white text-lg font-bold mb-2">
              Facebook Login Required
            </Text>
            <Text className="text-gray-400 text-sm mb-4">
              {fbLoginErrorMessage}
            </Text>
            <TouchableOpacity
              onPress={handleFacebookReauth}
              className="bg-blue-500 py-3 rounded-xl"
            >
              <Text className="text-white text-center">
                Login with Facebook
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFbLoginModalVisible(false)}
              className="bg-gray-800 py-3 rounded-xl mt-4"
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
