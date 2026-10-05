export function expandPlatforms(rawPlatforms) {
  return rawPlatforms.flatMap((platform) => {
    const selectedPages =
      platform.name === "Facebook" && platform.pages?.length > 0 && platform.selectedPageIds?.length > 0
        ? platform.pages.filter((page) => platform.selectedPageIds.includes(page.pageId))
        : [];

    if (selectedPages.length === 0) return [platform];

    return selectedPages.map((page) => ({
      ...platform,
      _id: `${platform._id}_page_${page.pageId}`,
      _parentId: platform._id,
      platformUsername: page.pageName,
      _pageId: page.pageId,
    }));
  });
}
