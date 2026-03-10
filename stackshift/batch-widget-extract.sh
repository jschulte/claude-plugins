#!/bin/bash

# Batch Widget Migration - Technology-Agnostic Extraction
# Processes Osiris and V9 widgets, extracting only portable artifacts

set -e

OUTPUT_BASE="/Users/jonah.schulte/git/ai/docs/specs/widgets"
OSIRIS_BASE="$HOME/git/osiris"
V9_BASE="$HOME/git/cms-web/htdocs/v9"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[$(date +%T)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%T)]${NC} $1"; }
error() { echo -e "${RED}[$(date +%T)]${NC} $1"; }

# Create output directory
mkdir -p "$OUTPUT_BASE"

# Osiris widgets
OSIRIS_WIDGETS=(
	"ws-specials"
	"ws-content-cta"
	"ws-facet-browse"
	"ws-rec-vehicles"
	"ws-hours"
	"ws-navigation"
	"ws-mycars-nav"
	"ws-site-text-search"
	"ws-ddc-logo"
	"ws-todays-hours"
	"ws-tps-placeholder"
	"ws-why-buy"
	"ws-dealer-services"
	"ws-dealer-reviews"
	"ws-dealership-badges"
	"ws-contact"
	"ws-subaru-prgrm-logos"
)

# V9 Velocity widgets (widget.vm path)
declare -A V9_WIDGETS=(
	["v9.widgets.header.default.v1"]="widgets/header/default/v1"
	["v9.widgets.navbar.default.v1"]="widgets/navbar/default/v1"
	["v9.widgets.navigation.default.v1"]="widgets/navigation/default/v1"
	["v9.widgets.footer.default.v1"]="widgets/footer/default/v1"
	["v9.widgets.footer.default.v2"]="widgets/footer/default/v2"
	["v9.widgets.content.default.v1"]="widgets/content/default/v1"
	["v9.widgets.content.hero.v1"]="widgets/content/hero/v1"
	["v9.widgets.content.alert-banner.v1"]="widgets/content/alert-banner/v1"
	["v9.widgets.content.disclaimer.v1"]="widgets/content/disclaimer/v1"
	["v9.widgets.content.tabbed.v1"]="widgets/content/tabbed/v1"
	["v9.widgets.content.text.v1"]="widgets/content/text/v1"
	["v9.widgets.content.page-title.v1"]="widgets/content/page-title/v1"
	["v9.widgets.model-selector.responsive.v1"]="widgets/model-selector/responsive/v1"
	["v9.widgets.inventory-featured.default.v1"]="widgets/inventory-featured/default/v1"
	["v9.widgets.inventory-search.facetbrowse.v1"]="widgets/inventory-search/facetbrowse/v1"
	["v9.widgets.inventory-search.facetlist.v3"]="widgets/inventory-search/facetlist/v3"
	["v9.widgets.inventory-search.payment.v1"]="widgets/inventory-search/payment/v1"
	["v9.widgets.inventory-search.form.v2"]="widgets/inventory-search/form/v2"
	["v9.widgets.inventory-search.forward.v1"]="widgets/inventory-search/forward/v1"
	["v9.widgets.service.lead-intro.v1"]="widgets/service/lead-intro/v1"
	["v9.widgets.hours.default.v1"]="widgets/hours/default/v1"
	["v9.widgets.contact.info.v1"]="widgets/contact/info/v1"
	["v9.widgets.contact.form.v1"]="widgets/contact/form/v1"
	["v9.widgets.links.list.v1"]="widgets/links/list/v1"
	["v9.widgets.links.locale.v1"]="widgets/links/locale/v1"
	["v9.widgets.links.print.v1"]="widgets/links/print/v1"
	["v9.widgets.buttonblock.default.v1"]="widgets/buttonblock/default/v1"
	["v9.widgets.slideshow.default.v1"]="widgets/slideshow/default/v1"
	["v9.widgets.image.default.v1"]="widgets/image/default/v1"
	["v9.widgets.tabs.tabbed-widgets.v1"]="widgets/tabs/tabbed-widgets/v1"
	["v9.widgets.video.youtube-player.v1"]="widgets/video/youtube-player/v1"
	["v9.widgets.include.velocity.v1"]="widgets/include/velocity/v1"
	["v9.widgets.postal-code.default.v1"]="widgets/postal-code/default/v1"
	["v9.widgets.incentives-featured.manual.v1"]="widgets/incentives-featured/manual/v1"
	["v9.widgets.showroom.lead.v1"]="widgets/showroom/lead/v1"
	["v9.widgets.map.static.v1"]="widgets/map/static/v1"
)

# V9 Viewmodel widgets (viewmodel subfolder)
declare -A V9_VIEWMODEL=(
	["v9.viewmodel.model-selector.parallax"]="viewmodel/widgets/model_selector/parallax"
	["v9.viewmodel.header.value_statement"]="viewmodel/widgets/header/value_statement"
	["v9.viewmodel.map.dynamic"]="viewmodel/widgets/map/dynamic"
	["v9.viewmodel.buttonblock.responsive"]="viewmodel/widgets/button_block/responsive"
	["v9.viewmodel.links.single-cta"]="viewmodel/widgets/links/single_cta"
	["v9.viewmodel.inventory-search.facet-browse"]="viewmodel/widgets/inventory_search/facet_browse"
	["v9.viewmodel.locations.mobile_call"]="viewmodel/widgets/locations/mobile_call"
)

# Process a single widget
process_widget() {
	local widget_name="$1"
	local widget_path="$2"
	local widget_type="$3"

	log "Processing: $widget_name ($widget_type)"

	# Create output directory for this widget
	local output_dir="$OUTPUT_BASE/$widget_name"
	mkdir -p "$output_dir"

	# Check if widget directory exists
	if [ ! -d "$widget_path" ]; then
		error "  Widget path not found: $widget_path"
		return 1
	fi

	# Navigate to widget directory
	cd "$widget_path"

	# Ensure we're on main/master branch with latest
	if [ -d ".git" ]; then
		git fetch origin >/dev/null 2>&1 || true
		if git rev-parse --verify main >/dev/null 2>&1; then
			git checkout main >/dev/null 2>&1
			git pull origin main >/dev/null 2>&1
		elif git rev-parse --verify master >/dev/null 2>&1; then
			git checkout master >/dev/null 2>&1
			git pull origin master >/dev/null 2>&1
		fi
	fi

	log "  Running widget migration pipeline..."

	# This will be replaced with actual Claude Code skill invocation
	# For now, create a marker file
	echo "PENDING: Migration for $widget_name" > "$output_dir/.pending"
	echo "Widget Path: $widget_path" >> "$output_dir/.pending"
	echo "Widget Type: $widget_type" >> "$output_dir/.pending"

	log "  ✓ Queued for processing: $widget_name"
}

# Process Osiris widgets
log "=== Processing Osiris Widgets ==="
for widget in "${OSIRIS_WIDGETS[@]}"; do
	process_widget "$widget" "$OSIRIS_BASE/$widget" "Osiris"
done

# Process V9 Velocity widgets
log "=== Processing V9 Velocity Widgets ==="
for widget_name in "${!V9_WIDGETS[@]}"; do
	widget_path="${V9_WIDGETS[$widget_name]}"
	process_widget "$widget_name" "$V9_BASE/$widget_path" "V9 Velocity"
done

# Process V9 Viewmodel widgets
log "=== Processing V9 Viewmodel Widgets ==="
for widget_name in "${!V9_VIEWMODEL[@]}"; do
	widget_path="${V9_VIEWMODEL[$widget_name]}"
	process_widget "$widget_name" "$V9_BASE/$widget_path" "V9 Viewmodel"
done

log "=== Batch Processing Setup Complete ==="
log "Output directory: $OUTPUT_BASE"
log "Total widgets queued: $((${#OSIRIS_WIDGETS[@]} + ${#V9_WIDGETS[@]} + ${#V9_VIEWMODEL[@]}))"
log ""
log "Next: Run Claude Code to process each .pending file"
