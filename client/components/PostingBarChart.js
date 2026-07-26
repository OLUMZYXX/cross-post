import { View, Text } from "react-native";
import { getColors } from "../constants/theme";

const CHART_HEIGHT = 120;
const MIN_BAR = 3;

export default function PostingBarChart({ daily = [], title = "POSTS PER DAY" }) {
  const colors = getColors();
  const max = daily.reduce((m, d) => Math.max(m, d.count), 0);
  const total = daily.reduce((sum, d) => sum + d.count, 0);
  const busiest = daily.reduce((a, b) => (b.count > (a?.count || 0) ? b : a), null);

  return (
    <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-3">
      <View className="flex-row items-baseline justify-between mb-1">
        <Text className="text-ink-soft text-[9px] tracking-[1.5px] uppercase">{title}</Text>
        <Text className="text-ink-soft text-[10px]">
          {max > 0 ? `peak ${max}` : "no posts"}
        </Text>
      </View>

      {total === 0 ? (
        <View style={{ height: CHART_HEIGHT }} className="items-center justify-center">
          <Text className="text-ink-muted text-xs">No posts this month.</Text>
        </View>
      ) : (
        <>
          <View
            className="flex-row items-end"
            style={{ height: CHART_HEIGHT, marginTop: 6 }}
          >
            {daily.map((d) => {
              const isPeak = busiest && d.day === busiest.day && d.count === max;
              const height =
                d.count > 0
                  ? Math.max((d.count / max) * (CHART_HEIGHT - 18), 6)
                  : MIN_BAR;
              return (
                <View key={d.day} className="flex-1 items-center" style={{ paddingHorizontal: 1 }}>
                  {isPeak ? (
                    <Text
                      className="text-ink font-sans-bold"
                      style={{ fontSize: 9, marginBottom: 2 }}
                    >
                      {d.count}
                    </Text>
                  ) : null}
                  <View
                    style={{
                      width: "100%",
                      height,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      backgroundColor:
                        d.count > 0
                          ? isPeak
                            ? colors.terracotta
                            : `${colors.terracotta}99`
                          : colors.rule,
                    }}
                  />
                </View>
              );
            })}
          </View>

          <View className="flex-row justify-between mt-1.5">
            {daily
              .filter((d) => d.day === 1 || d.day % 5 === 0)
              .map((d) => (
                <Text key={d.day} className="text-ink-soft" style={{ fontSize: 9 }}>
                  {d.day}
                </Text>
              ))}
          </View>
          <Text className="text-ink-soft text-[9px] mt-1">Day of month</Text>
        </>
      )}
    </View>
  );
}
