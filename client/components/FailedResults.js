import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM_STYLES } from "./sentPostUtils";

function FailedRow({ result, isRetrying, isRetryingAll, onRetry }) {
  const style = PLATFORM_STYLES[result.platform];
  return (
    <View className="flex-row items-center bg-gray-950/60 rounded-xl px-3 py-2.5 mb-1.5">
      <View className="flex-row items-center flex-1">
        {style && (
          <View className="w-7 h-7 rounded-lg bg-gray-800 items-center justify-center mr-2.5">
            <Ionicons name={style.icon} size={14} color="#f87171" />
          </View>
        )}
        <View className="flex-1 mr-2">
          <Text className="text-white text-xs font-medium">{result.platform}</Text>
          <Text className="text-gray-500 text-[10px] mt-0.5" numberOfLines={1}>
            {result.error || "Publishing failed"}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onRetry}
        disabled={isRetrying || isRetryingAll}
        className={`flex-row items-center px-3 py-1.5 rounded-lg ${
          isRetrying || isRetryingAll ? "bg-gray-700" : "bg-red-500/20"
        }`}
      >
        {isRetrying ? (
          <ActivityIndicator size="small" color="#f87171" />
        ) : (
          <>
            <Ionicons name="refresh" size={12} color="#f87171" />
            <Text className="text-red-400 text-xs font-semibold ml-1">Retry</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function FailedResults({
  postId,
  failedResults,
  retryingMap,
  onRetry,
  onRetryAll,
  post,
}) {
  const isRetryingAll = retryingMap[`${postId}-all`];

  return (
    <View className="bg-red-500/5 rounded-xl border border-red-500/15 p-3 mb-3">
      <View className="flex-row items-center mb-2.5">
        <Ionicons name="alert-circle" size={14} color="#f87171" />
        <Text className="text-red-400 text-xs font-semibold ml-1.5">
          Failed ({failedResults.length})
        </Text>
      </View>
      {failedResults.map((result, idx) => {
        const retryKey = `${postId}-${result.platform}-${idx}`;
        return (
          <FailedRow
            key={`${result.platform}-${idx}`}
            result={result}
            isRetrying={retryingMap[retryKey]}
            isRetryingAll={isRetryingAll}
            onRetry={() => onRetry(post, result.platform)}
          />
        );
      })}
      {failedResults.length > 1 && (
        <TouchableOpacity
          onPress={() => onRetryAll(post)}
          disabled={isRetryingAll}
          className={`flex-row items-center justify-center py-2.5 rounded-xl mt-1.5 ${
            isRetryingAll ? "bg-gray-700" : "bg-red-500/15"
          }`}
        >
          {isRetryingAll ? (
            <ActivityIndicator size="small" color="#f87171" />
          ) : (
            <>
              <Ionicons name="refresh" size={14} color="#f87171" />
              <Text className="text-red-400 text-xs font-bold ml-1.5">Retry All</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
