## MODIFIED Requirements

### Requirement: Usage Insights Display
The system SHALL display usage statistics and visualizations to help users understand their energy consumption patterns.

#### Scenario: Statistics display
- **WHEN** usage statistics are calculated
- **THEN** total annual consumption is displayed prominently
- **AND** average monthly breakdown is shown
- **AND** peak usage patterns are displayed

#### Scenario: Monthly consumption chart
- **WHEN** usage data is available
- **THEN** a bar chart displays monthly consumption using Recharts
- **AND** the chart is responsive and works on mobile devices
- **AND** the chart shows all 12 months of data

#### Scenario: Progressive disclosure
- **WHEN** a CSV file is uploaded
- **THEN** the upload interface is replaced with usage insights
- **AND** statistics and chart are displayed immediately after parsing

#### Scenario: AI insights display
- **WHEN** AI analysis is available (either from API or cache)
- **THEN** AI-generated insights are displayed in a dedicated section
- **AND** insights include peak usage time patterns with icons
- **AND** insights include seasonal trends with icons
- **AND** insights include actionable recommendations with icons
- **AND** all insights are formatted in readable cards

#### Scenario: AI insights loading state
- **WHEN** AI analysis is in progress
- **THEN** a loading indicator is displayed in the AI insights section
- **AND** the loading state is clearly visible to the user
- **AND** basic statistics and chart are still displayed (not blocked by AI loading)

#### Scenario: AI insights error state
- **WHEN** AI analysis fails or is unavailable
- **THEN** the AI insights section is not displayed or shows an error message
- **AND** basic statistics and chart continue to function normally
- **AND** the page remains fully functional without AI insights

