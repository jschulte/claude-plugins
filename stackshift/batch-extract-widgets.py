#!/usr/bin/env python3
"""
Batch Widget Extraction - Technology-Agnostic Artifacts Only

Processes 55 widgets (Osiris + V9) and extracts portable specifications.
"""

import os
import json
import subprocess
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Widget:
    name: str
    path: str
    type: str  # "Osiris", "V9 Velocity", "V9 Viewmodel"

    @property
    def output_dir(self):
        return Path("/Users/jonah.schulte/git/ai/docs/specs/widgets") / self.name

# Widget definitions
OSIRIS_WIDGETS = [
    Widget("ws-specials", "~/git/osiris/ws-specials", "Osiris"),
    Widget("ws-content-cta", "~/git/osiris/ws-content-cta", "Osiris"),
    Widget("ws-facet-browse", "~/git/osiris/ws-facet-browse", "Osiris"),
    Widget("ws-rec-vehicles", "~/git/osiris/ws-rec-vehicles", "Osiris"),
    Widget("ws-hours", "~/git/osiris/ws-hours", "Osiris"),
    Widget("ws-navigation", "~/git/osiris/ws-navigation", "Osiris"),
    Widget("ws-mycars-nav", "~/git/osiris/ws-mycars-nav", "Osiris"),
    Widget("ws-site-text-search", "~/git/osiris/ws-site-text-search", "Osiris"),
    Widget("ws-ddc-logo", "~/git/osiris/ws-ddc-logo", "Osiris"),
    Widget("ws-todays-hours", "~/git/osiris/ws-todays-hours", "Osiris"),
    Widget("ws-tps-placeholder", "~/git/osiris/ws-tps-placeholder", "Osiris"),
    Widget("ws-why-buy", "~/git/osiris/ws-why-buy", "Osiris"),
    Widget("ws-dealer-services", "~/git/osiris/ws-dealer-services", "Osiris"),
    Widget("ws-dealer-reviews", "~/git/osiris/ws-dealer-reviews", "Osiris"),
    Widget("ws-dealership-badges", "~/git/osiris/ws-dealership-badges", "Osiris"),
    Widget("ws-contact", "~/git/osiris/ws-contact", "Osiris"),
    Widget("ws-subaru-prgrm-logos", "~/git/osiris/ws-subaru-prgrm-logos", "Osiris"),
]

V9_VELOCITY_WIDGETS = [
    Widget("v9.widgets.header.default.v1", "~/git/cms-web/htdocs/v9/widgets/header/default/v1", "V9 Velocity"),
    Widget("v9.widgets.navbar.default.v1", "~/git/cms-web/htdocs/v9/widgets/navbar/default/v1", "V9 Velocity"),
    Widget("v9.widgets.navigation.default.v1", "~/git/cms-web/htdocs/v9/widgets/navigation/default/v1", "V9 Velocity"),
    Widget("v9.widgets.footer.default.v1", "~/git/cms-web/htdocs/v9/widgets/footer/default/v1", "V9 Velocity"),
    Widget("v9.widgets.footer.default.v2", "~/git/cms-web/htdocs/v9/widgets/footer/default/v2", "V9 Velocity"),
    Widget("v9.widgets.content.default.v1", "~/git/cms-web/htdocs/v9/widgets/content/default/v1", "V9 Velocity"),
    Widget("v9.widgets.content.hero.v1", "~/git/cms-web/htdocs/v9/widgets/content/hero/v1", "V9 Velocity"),
    Widget("v9.widgets.content.alert-banner.v1", "~/git/cms-web/htdocs/v9/widgets/content/alert-banner/v1", "V9 Velocity"),
    Widget("v9.widgets.content.disclaimer.v1", "~/git/cms-web/htdocs/v9/widgets/content/disclaimer/v1", "V9 Velocity"),
    Widget("v9.widgets.content.tabbed.v1", "~/git/cms-web/htdocs/v9/widgets/content/tabbed/v1", "V9 Velocity"),
    Widget("v9.widgets.content.text.v1", "~/git/cms-web/htdocs/v9/widgets/content/text/v1", "V9 Velocity"),
    Widget("v9.widgets.content.page-title.v1", "~/git/cms-web/htdocs/v9/widgets/content/page-title/v1", "V9 Velocity"),
    Widget("v9.widgets.model-selector.responsive.v1", "~/git/cms-web/htdocs/v9/widgets/model-selector/responsive/v1", "V9 Velocity"),
    Widget("v9.widgets.inventory-featured.default.v1", "~/git/cms-web/htdocs/v9/widgets/inventory-featured/default/v1", "V9 Velocity"),
    Widget("v9.widgets.inventory-search.facetbrowse.v1", "~/git/cms-web/htdocs/v9/widgets/inventory-search/facetbrowse/v1", "V9 Velocity"),
    Widget("v9.widgets.inventory-search.facetlist.v3", "~/git/cms-web/htdocs/v9/widgets/inventory-search/facetlist/v3", "V9 Velocity"),
    Widget("v9.widgets.inventory-search.payment.v1", "~/git/cms-web/htdocs/v9/widgets/inventory-search/payment/v1", "V9 Velocity"),
    Widget("v9.widgets.inventory-search.form.v2", "~/git/cms-web/htdocs/v9/widgets/inventory-search/form/v2", "V9 Velocity"),
    Widget("v9.widgets.inventory-search.forward.v1", "~/git/cms-web/htdocs/v9/widgets/inventory-search/forward/v1", "V9 Velocity"),
    Widget("v9.widgets.service.lead-intro.v1", "~/git/cms-web/htdocs/v9/widgets/service/lead-intro/v1", "V9 Velocity"),
    Widget("v9.widgets.hours.default.v1", "~/git/cms-web/htdocs/v9/widgets/hours/default/v1", "V9 Velocity"),
    Widget("v9.widgets.contact.info.v1", "~/git/cms-web/htdocs/v9/widgets/contact/info/v1", "V9 Velocity"),
    Widget("v9.widgets.contact.form.v1", "~/git/cms-web/htdocs/v9/widgets/contact/form/v1", "V9 Velocity"),
    Widget("v9.widgets.links.list.v1", "~/git/cms-web/htdocs/v9/widgets/links/list/v1", "V9 Velocity"),
    Widget("v9.widgets.links.locale.v1", "~/git/cms-web/htdocs/v9/widgets/links/locale/v1", "V9 Velocity"),
    Widget("v9.widgets.links.print.v1", "~/git/cms-web/htdocs/v9/widgets/links/print/v1", "V9 Velocity"),
    Widget("v9.widgets.buttonblock.default.v1", "~/git/cms-web/htdocs/v9/widgets/buttonblock/default/v1", "V9 Velocity"),
    Widget("v9.widgets.slideshow.default.v1", "~/git/cms-web/htdocs/v9/widgets/slideshow/default/v1", "V9 Velocity"),
    Widget("v9.widgets.image.default.v1", "~/git/cms-web/htdocs/v9/widgets/image/default/v1", "V9 Velocity"),
    Widget("v9.widgets.tabs.tabbed-widgets.v1", "~/git/cms-web/htdocs/v9/widgets/tabs/tabbed-widgets/v1", "V9 Velocity"),
    Widget("v9.widgets.video.youtube-player.v1", "~/git/cms-web/htdocs/v9/widgets/video/youtube-player/v1", "V9 Velocity"),
    Widget("v9.widgets.include.velocity.v1", "~/git/cms-web/htdocs/v9/widgets/include/velocity/v1", "V9 Velocity"),
    Widget("v9.widgets.postal-code.default.v1", "~/git/cms-web/htdocs/v9/widgets/postal-code/default/v1", "V9 Velocity"),
    Widget("v9.widgets.incentives-featured.manual.v1", "~/git/cms-web/htdocs/v9/widgets/incentives-featured/manual/v1", "V9 Velocity"),
    Widget("v9.widgets.showroom.lead.v1", "~/git/cms-web/htdocs/v9/widgets/showroom/lead/v1", "V9 Velocity"),
    Widget("v9.widgets.map.static.v1", "~/git/cms-web/htdocs/v9/widgets/map/static/v1", "V9 Velocity"),
]

V9_VIEWMODEL_WIDGETS = [
    Widget("v9.viewmodel.model-selector.parallax", "~/git/cms-web/htdocs/v9/viewmodel/widgets/model_selector/parallax", "V9 Viewmodel"),
    Widget("v9.viewmodel.header.value_statement", "~/git/cms-web/htdocs/v9/viewmodel/widgets/header/value_statement", "V9 Viewmodel"),
    Widget("v9.viewmodel.map.dynamic", "~/git/cms-web/htdocs/v9/viewmodel/widgets/map/dynamic", "V9 Viewmodel"),
    Widget("v9.viewmodel.buttonblock.responsive", "~/git/cms-web/htdocs/v9/viewmodel/widgets/button_block/responsive", "V9 Viewmodel"),
    Widget("v9.viewmodel.links.single-cta", "~/git/cms-web/htdocs/v9/viewmodel/widgets/links/single_cta", "V9 Viewmodel"),
    Widget("v9.viewmodel.inventory-search.facet-browse", "~/git/cms-web/htdocs/v9/viewmodel/widgets/inventory_search/facet_browse", "V9 Viewmodel"),
    Widget("v9.viewmodel.locations.mobile_call", "~/git/cms-web/htdocs/v9/viewmodel/widgets/locations/mobile_call", "V9 Viewmodel"),
]

ALL_WIDGETS = OSIRIS_WIDGETS + V9_VELOCITY_WIDGETS + V9_VIEWMODEL_WIDGETS


def verify_widget_exists(widget: Widget) -> bool:
    """Check if widget directory exists."""
    path = Path(widget.path).expanduser()
    exists = path.exists() and path.is_dir()
    if exists:
        print(f"✓ {widget.name}")
    else:
        print(f"✗ {widget.name} - NOT FOUND at {widget.path}")
    return exists


def checkout_main_branch(widget: Widget) -> bool:
    """Checkout main or master branch and pull latest."""
    path = Path(widget.path).expanduser()
    git_dir = path / ".git"

    if not git_dir.exists():
        print(f"  ⚠ No git repo for {widget.name}")
        return True  # Not a git repo, that's OK

    try:
        # Check current branch
        result = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=path,
            capture_output=True,
            text=True,
            check=True
        )
        current_branch = result.stdout.strip()

        # Try main first, then master
        for branch in ["main", "master"]:
            check_branch = subprocess.run(
                ["git", "rev-parse", "--verify", branch],
                cwd=path,
                capture_output=True,
                check=False
            )
            if check_branch.returncode == 0:
                if current_branch != branch:
                    subprocess.run(["git", "checkout", branch], cwd=path, check=True)
                subprocess.run(["git", "pull", "origin", branch], cwd=path, check=True)
                print(f"  → Updated {branch}")
                return True

        print(f"  ⚠ No main/master branch")
        return True

    except subprocess.CalledProcessError as e:
        print(f"  ✗ Git error: {e}")
        return False


def create_widget_manifest(widget: Widget):
    """Create a manifest file for Claude Code to process."""
    widget.output_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "widget_name": widget.name,
        "widget_path": widget.path,
        "widget_type": widget.type,
        "output_directory": str(widget.output_dir),
        "extract_artifacts": [
            "portable-epics.md",
            "portable-component-spec.md",
            "preference-catalog.md"
        ],
        "status": "pending"
    }

    manifest_file = widget.output_dir / "extraction-manifest.json"
    with open(manifest_file, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"  → Manifest created: {manifest_file}")


def main():
    print("=" * 80)
    print("Widget Batch Extraction - Technology-Agnostic Artifacts Only")
    print("=" * 80)
    print()

    # Step 1: Verify all widgets exist
    print("Step 1: Verifying widget paths...")
    print("-" * 80)

    valid_widgets = []
    missing_widgets = []

    for widget in ALL_WIDGETS:
        if verify_widget_exists(widget):
            valid_widgets.append(widget)
        else:
            missing_widgets.append(widget)

    print()
    print(f"Valid: {len(valid_widgets)} | Missing: {len(missing_widgets)}")
    print()

    if missing_widgets:
        print("Missing widgets:")
        for w in missing_widgets:
            print(f"  - {w.name}")
        print()

    # Step 2: Checkout main/master for all widgets
    print("Step 2: Checking out main/master branches...")
    print("-" * 80)

    ready_widgets = []
    for widget in valid_widgets:
        if checkout_main_branch(widget):
            ready_widgets.append(widget)

    print()
    print(f"Ready for processing: {len(ready_widgets)}")
    print()

    # Step 3: Create manifests for Claude Code to process
    print("Step 3: Creating extraction manifests...")
    print("-" * 80)

    for widget in ready_widgets:
        create_widget_manifest(widget)

    print()
    print("=" * 80)
    print("Setup Complete!")
    print("=" * 80)
    print()
    print(f"Total widgets ready: {len(ready_widgets)}")
    print(f"Output directory: /Users/jonah.schulte/git/ai/docs/specs/widgets")
    print()
    print("Next: Process each widget with Claude Code using /stackshift.widget-migrate")
    print()

    # Generate summary file
    summary_file = Path("/Users/jonah.schulte/git/ai/docs/specs/widgets/EXTRACTION_SUMMARY.md")
    summary_file.parent.mkdir(parents=True, exist_ok=True)

    with open(summary_file, 'w') as f:
        f.write("# Widget Extraction Summary\n\n")
        f.write(f"Total Widgets: {len(ready_widgets)}\n\n")
        f.write("## Widgets Ready for Processing\n\n")

        for widget_type in ["Osiris", "V9 Velocity", "V9 Viewmodel"]:
            widgets_of_type = [w for w in ready_widgets if w.type == widget_type]
            f.write(f"### {widget_type} ({len(widgets_of_type)})\n\n")
            for w in widgets_of_type:
                f.write(f"- [ ] {w.name}\n")
            f.write("\n")

        f.write("## Artifacts to Extract\n\n")
        f.write("For each widget:\n")
        f.write("- `portable-epics.md` - Technology-agnostic epic specifications\n")
        f.write("- `portable-component-spec.md` - Business rules and data contracts\n")
        f.write("- `preference-catalog.md` - Configuration mapping\n")

    print(f"Summary written to: {summary_file}")


if __name__ == "__main__":
    main()
