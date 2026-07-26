import { View, Text } from "react-native";
import { getColors } from "../constants/theme";

const CHART_HEIGHT = 120;
const MIN_BAR = 3;

export default function PostingBarChart({
  data = [],
  title = "POSTS PER DAY",
  labelMode = "sparse",
  caption,
}) {
  const colors = getColors();
  const max = data.reduce((m, d) => Math.max(m, d.count), 0);
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const wide = labelMode === "all";

  return (
    <View className="bg-paper-light border border-rule rounded-2xl p-4 mb-3">
      <View className="flex-row items-baseline justify-between mb-1">
        <Text className="text-ink-soft text-[9px] tracking-[1.5px] uppercase">{title}</Text>
        <Text className="text-ink-soft text-[10px]">{max > 0 ? `peak ${max}` : "no posts"}</Text>
      </View>

      {total === 0 ? (
        <View style={{ height: CHART_HEIGHT }} className="items-center justify-center">
          <Text className="text-ink-muted text-xs">No posts this month.</Text>
        </View>
      ) : (
        <>
          <View className="flex-row items-end" style={{ height: CHART_HEIGHT, marginTop: 6 }}>
            {data.map((d, index) => {
              const isPeak = d.count === max && d.count > 0;
              const height =
                d.count > 0 ? Math.max((d.count / max) * (CHART_HEIGHT - 18), 6) : MIN_BAR;
              const showValue = wide ? d.count > 0 : isPeak;
              return (
                <View
                  key={d.key ?? d.label ?? index}
                  className="flex-1 items-center"
                  style={{ paddingHorizontal: wide ? 4 : 1 }}
                >
                  {showValue ? (
                    <Text
                      className={isPeak ? "text-ink font-sans-bold" : "text-ink-muted"}
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

          {wide ? (
            <View className="flex-row mt-1.5">
              {data.map((d, index) => (
                <View key={d.label ?? index} className="flex-1 items-center">
                  <Text
                    className={d.count === max && max > 0 ? "text-ink font-sans-bold" : "text-ink-soft"}
                    style={{ fontSize: 10 }}
                  >
                    {d.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row justify-between mt-1.5">
              {data
                .filter((d, i) => i === 0 || (i + 1) % 5 === 0)
                .map((d, index) => (
                  <Text key={d.key ?? index} className="text-ink-soft" style={{ fontSize: 9 }}>
                    {d.label}
                  </Text>
                ))}
            </View>
          )}

          {caption ? (
            <Text className="text-ink-soft text-[9px] mt-1">{caption}</Text>
          ) : null}
        </>
      )}
    </View>
  );
}
