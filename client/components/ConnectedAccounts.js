import { useState, useEffect, useCallback } from "react";
import { getColors } from "../constants/theme";
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
  Twitter: { icon: "logo-twitter", bg: "bg-paper-deep", color: getColors().olive },
  Instagram: { icon: "logo-instagram", bg: "bg-paper-deep", color: getColors().terracotta },
  LinkedIn: { icon: "logo-linkedin", bg: "bg-paper-deep", color: getColors().olive },
  Facebook: { icon: "logo-facebook", bg: "bg-paper-deep", color: "#1d4ed8" },
  TikTok: { icon: "logo-tiktok", bg: "bg-paper-deep", color: "#e5e7eb" },
  YouTube: { icon: "logo-youtube", bg: "bg-terracotta/20", color: getColors().terracotta },
  Reddit: { icon: "logo-reddit", bg: "bg-paper-deep", color: "#f97316" },
  Telegram: { icon: "paper-plane", bg: "bg-paper-deep", color: "#0ea5e9" },
};

export default function ConnectedAccounts({ onBack, onOpenConnectModal }) {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagePickerVisible, setPagePickerVisible] = useState(false);
  const [fbPages, setFbPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [togglingPageId, setTogglingPageId] = useState(null);
  const [togglingActiveId, setTogglingActiveId] = useState(null);
  const { showToast } = useToast();

  const fetchPlatforms = useCallback(async () => {
    try {
      const { data } = await platformAPI.list();

      const expanded = [];
      for (const p of data.platforms) {
        if (
          p.name === "Facebook" &&
          p.pages &&
          p.pages.length > 0 &&
          p.selectedPageIds &&
          p.selectedPageIds.length > 0
        ) {
          const selectedPages = p.pages.filter((pg) =>
            p.selectedPageIds.includes(pg.pageId),
          );
          for (const page of selectedPages) {
            expanded.push({
              ...p,
              _id: `${p._id}_page_${page.pageId}`,
              _parentId: p._id,
              name: "Facebook",
              platformUsername: page.pageName,
              _pageId: page.pageId,
            });
          }
        } else {
          expanded.push(p);
        }
      }

      setPlatforms(expanded);
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
      if (platform._pageId) {
        await platformAPI.toggleFacebookPage(platform._pageId, false);
        setPlatforms((prev) => prev.filter((p) => p._id !== platform._id));
        showToast({ type: "success", title: `${platform.platformUsername || "Page"} removed` });
        return;
      }
      await platformAPI.disconnect(platform._id);
      setPlatforms((prev) => prev.filter((p) => p._id !== platform._id));
      showToast({ type: "success", title: `${platform.name} disconnected` });
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    }
  };

  const handleToggleActive = async (platform) => {
    const realId = platform._parentId || platform._id;
    const newActive = platform.active === false;
    setTogglingActiveId(realId);
    try {
      await platformAPI.toggleActive(realId, newActive);
      setPlatforms((prev) =>
        prev.map((p) => {
          const pRealId = p._parentId || p._id;
          if (pRealId === realId) return { ...p, active: newActive };
          return p;
        }),
      );
      const label = platform.platformUsername || platform.name;
      showToast({
        type: "success",
        title: newActive ? "Account activated" : "Account deactivated",
        message: newActive
          ? `${label} will be included when posting`
          : `${label} will not be included when posting`,
      });
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    } finally {
      setTogglingActiveId(null);
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
      setPagePickerVisible(false);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleTogglePage = async (pageId, currentlySelected) => {
    setTogglingPageId(pageId);
    try {
      const newSelected = !currentlySelected;
      await platformAPI.toggleFacebookPage(pageId, newSelected);

      setFbPages((prev) =>
        prev.map((p) =>
          p.id === pageId ? { ...p, isSelected: newSelected } : p,
        ),
      );

      const pageName = fbPages.find((p) => p.id === pageId)?.name || pageId;
      showToast({
        type: "success",
        title: newSelected ? "Page enabled" : "Page disabled",
        message: newSelected
          ? `"${pageName}" will be included when posting`
          : `"${pageName}" will not be included when posting`,
      });
    } catch (err) {
      showToast({ type: "error", title: "Failed", message: err.message });
    } finally {
      setTogglingPageId(null);
    }
  };

  const handleClosePagePicker = () => {
    setPagePickerVisible(false);
    fetchPlatforms();
  };

  const getFbSelectedCount = (platform) => {
    if (platform.name !== "Facebook") return null;
    const selected = platform.selectedPageIds?.length || 0;
    const total = platform.pages?.length || 0;
    if (total === 0) return null;
    return `${selected}/${total} pages`;
  };

  return (
    <View className="flex-1 bg-paper px-6 pt-16">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={getColors().ink} />
        </TouchableOpacity>
        <Text className="text-ink text-xl font-serif-bold flex-1">
          Connected Accounts
        </Text>
        <Text className="text-ink-muted text-sm">{platforms.length}</Text>
      </View>

      {loading ? (
        <View className="items-center py-12">
          <ActivityIndicator color={getColors().terracotta} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {platforms.map((platform) => {
            const style = PLATFORM_STYLES[platform.name] || {};
            const pageInfo = getFbSelectedCount(platform);
            return (
              <View
                key={platform._id}
                className="bg-paper-light rounded-2xl p-4 border border-rule mb-3"
              >
                <View className="flex-row items-center">
                  <View
                    className={`w-11 h-11 rounded-full ${style.bg || "bg-paper-deep"} items-center justify-center mr-3`}
                  >
                    <Ionicons
                      name={style.icon || "globe-outline"}
                      size={22}
                      color={style.color || "#fff"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-sans-bold text-sm ${platform.active === false ? "text-ink-muted" : "text-ink"}`}
                      numberOfLines={1}
                    >
                      {platform.platformUsername || platform.name}
                    </Text>
                    <Text className="text-ink-muted text-xs">
                      {platform.name}
                      {pageInfo ? ` · ${pageInfo}` : ""}
                      {platform.active === false ? " · Inactive" : ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleToggleActive(platform)}
                    disabled={togglingActiveId === (platform._parentId || platform._id)}
                    className="mr-3"
                  >
                    {togglingActiveId === (platform._parentId || platform._id) ? (
                      <ActivityIndicator size="small" color={getColors().terracotta} />
                    ) : (
                      <Ionicons
                        name={platform.active !== false ? "checkbox" : "square-outline"}
                        size={24}
                        color={platform.active !== false ? getColors().terracotta : getColors().inkMuted}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDisconnect(platform)}
                    className="bg-terracotta/15 px-3 py-2 rounded-lg border border-terracotta/30"
                  >
                    <Text className="text-terracotta text-xs font-sans-medium">
                      Disconnect
                    </Text>
                  </TouchableOpacity>
                </View>

                {platform.name === "Facebook" && !platform._pageId && (
                  <TouchableOpacity
                    onPress={handleOpenPagePicker}
                    className="mt-3 bg-paper-deep py-2.5 rounded-lg border border-rule flex-row items-center justify-center"
                  >
                    <Ionicons name="list" size={16} color={getColors().olive} />
                    <Text className="text-olive text-xs font-sans-medium ml-2">
                      Manage Pages
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <TouchableOpacity
            onPress={onOpenConnectModal}
            className="bg-paper-light rounded-2xl p-4 border border-rule mb-3 flex-row items-center"
            style={{ borderStyle: "dashed" }}
          >
            <View className="w-11 h-11 rounded-full bg-terracotta-soft/40 items-center justify-center mr-3">
              <Ionicons name="add" size={22} color={getColors().terracotta} />
            </View>
            <Text className="text-terracotta font-sans-medium">Add New Account</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={pagePickerVisible}
        onRequestClose={handleClosePagePicker}
      >
        <View className="flex-1 justify-center items-center bg-ink/50">
          <View className="bg-paper-light rounded-3xl p-6 w-80 max-h-96">
            <Text className="text-ink text-lg font-serif-bold mb-2">
              Facebook Pages
            </Text>
            <Text className="text-ink-muted text-xs mb-4">
              Select which pages to post to when publishing
            </Text>

            {loadingPages ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={getColors().olive} />
              </View>
            ) : fbPages.length === 0 ? (
              <View className="py-6 px-2 items-center">
                <Text className="text-ink-muted text-sm text-center mb-4">
                  No Facebook Pages found. Make sure you gave access to your
                  pages during Facebook login, or create a new Page.
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL("https://www.facebook.com/pages/create")
                  }
                  className="bg-ink py-2 px-3 rounded-xl"
                >
                  <Text className="text-paper-light text-sm font-sans-semibold">
                    Create a Facebook Page
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {fbPages.map((page) => (
                  <TouchableOpacity
                    key={page.id}
                    onPress={() => handleTogglePage(page.id, page.isSelected)}
                    disabled={togglingPageId !== null}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      page.isSelected
                        ? "bg-paper-deep border border-rule"
                        : "bg-paper-deep"
                    }`}
                  >
                    <View className="w-10 h-10 rounded-full bg-paper-deep items-center justify-center mr-3">
                      <Ionicons
                        name="logo-facebook"
                        size={20}
                        color="#1d4ed8"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-ink font-sans-medium text-sm"
                        numberOfLines={1}
                      >
                        {page.name}
                      </Text>
                      {page.category ? (
                        <Text className="text-ink-muted text-xs">
                          {page.category}
                        </Text>
                      ) : null}
                    </View>
                    {togglingPageId === page.id ? (
                      <ActivityIndicator size="small" color={getColors().olive} />
                    ) : (
                      <Ionicons
                        name={
                          page.isSelected
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={22}
                        color={page.isSelected ? getColors().olive : getColors().inkMuted}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={handleClosePagePicker}
              className="bg-paper-deep py-3 rounded-xl mt-4"
            >
              <Text className="text-ink text-center">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
