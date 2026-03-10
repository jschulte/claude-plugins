# Widget Batch Processing Plan

## Overview
Extract technology-agnostic artifacts from 50+ widgets across Osiris and V9 platforms.

## Widget Inventory

### Osiris Widgets (17 total)
Located in: `~/git/osiris/{widget-name}/`

- ws-specials
- ws-content-cta
- ws-facet-browse
- ws-rec-vehicles
- ws-hours
- ws-navigation
- ws-mycars-nav
- ws-site-text-search
- ws-ddc-logo
- ws-todays-hours
- ws-tps-placeholder
- ws-why-buy
- ws-dealer-services
- ws-dealer-reviews
- ws-dealership-badges
- ws-contact
- ws-subaru-prgrm-logos

### V9 Velocity Widgets (31 total)
Located in: `~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/`

1. v9.widgets.header.default.v1
2. v9.widgets.navbar.default.v1
3. v9.widgets.navigation.default.v1
4. v9.widgets.footer.default.v1
5. v9.widgets.footer.default.v2
6. v9.widgets.content.default.v1
7. v9.widgets.content.hero.v1
8. v9.widgets.content.alert-banner.v1
9. v9.widgets.content.disclaimer.v1
10. v9.widgets.content.tabbed.v1
11. v9.widgets.content.text.v1
12. v9.widgets.content.page-title.v1
13. v9.widgets.model-selector.responsive.v1
14. v9.widgets.inventory-featured.default.v1
15. v9.widgets.inventory-search.facetbrowse.v1
16. v9.widgets.inventory-search.facetlist.v3
17. v9.widgets.inventory-search.payment.v1
18. v9.widgets.inventory-search.form.v2
19. v9.widgets.inventory-search.forward.v1
20. v9.widgets.service.lead-intro.v1
21. v9.widgets.hours.default.v1
22. v9.widgets.contact.info.v1
23. v9.widgets.contact.form.v1
24. v9.widgets.links.list.v1
25. v9.widgets.links.locale.v1
26. v9.widgets.links.print.v1
27. v9.widgets.buttonblock.default.v1
28. v9.widgets.slideshow.default.v1
29. v9.widgets.image.default.v1
30. v9.widgets.tabs.tabbed-widgets.v1
31. v9.widgets.video.youtube-player.v1
32. v9.widgets.include.velocity.v1
33. v9.widgets.postal-code.default.v1
34. v9.widgets.incentives-featured.manual.v1
35. v9.widgets.showroom.lead.v1
36. v9.widgets.map.static.v1

### V9 Viewmodel Widgets (7 total)
Located in: `~/git/cms-web/htdocs/v9/viewmodel/widgets/{category}/{name}/`

1. v9.viewmodel.model-selector.parallax
2. v9.viewmodel.header.value_statement
3. v9.viewmodel.map.dynamic
4. v9.viewmodel.buttonblock.responsive
5. v9.viewmodel.links.single-cta
6. v9.viewmodel.inventory-search.facet-browse
7. v9.viewmodel.locations.mobile_call

## Total: 55 widgets

## Processing Strategy

### Parallel Processing Approach
Process widgets in batches of 5 using Task tool with multiple agents:

**Batch 1-11** (55 widgets / 5 = 11 batches)
- Each batch processes 5 widgets concurrently
- Extract only portable artifacts:
  - `portable-epics.md`
  - `portable-component-spec.md`
  - `preference-catalog.md` (tech-agnostic)

### Output Structure
```
/Users/jonah.schulte/git/ai/docs/specs/widgets/
  ws-specials/
    portable-epics.md
    portable-component-spec.md
    preference-catalog.md
  v9.widgets.header.default.v1/
    portable-epics.md
    portable-component-spec.md
    preference-catalog.md
  ...
```

## Execution Plan

### Step 1: Verify Widget Paths
- Check all widget directories exist
- Verify on main/master branch
- Pull latest changes

### Step 2: Process in Batches
- Spawn 5 Task agents per batch
- Each agent runs stackshift.widget-migrate on one widget
- Extract portable artifacts only
- Copy to target directory

### Step 3: Consolidate Results
- Generate index of all extracted widgets
- Report any failures or warnings
- Provide summary statistics

## Time Estimate
- ~3-5 minutes per widget (with parallel processing)
- 11 batches × 3 minutes = ~33 minutes total
- Sequential would be ~275 minutes (4.5 hours)

## Next Actions
1. Run verification script to check widget paths
2. Start batch 1 (first 5 widgets)
3. Monitor progress and adjust concurrency if needed
4. Continue through all batches
