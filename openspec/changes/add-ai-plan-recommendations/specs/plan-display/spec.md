## MODIFIED Requirements

### Requirement: Top Recommendations Section
The system SHALL display a dedicated section showing the top 3 recommended plans with AI-generated personalized explanations.

#### Scenario: Recommendations displayed
- **WHEN** usage data is available and costs are calculated
- **THEN** a "Top Recommendations" section appears
- **AND** displays the top 3 plans as cards based on user preference
- **AND** each recommendation card shows AI-generated personalized explanation instead of hardcoded label
- **AND** each recommendation card displays pros and cons specific to the user's usage patterns
- **AND** each recommendation card displays "Good for" badges (e.g., "night owl", "solar home") if applicable
- **AND** savings amount is highlighted prominently

#### Scenario: Recommendations loading state
- **WHEN** AI recommendations are being fetched
- **THEN** loading indicators are displayed on recommendation cards
- **AND** plan cards are still visible with cost information
- **AND** explanations appear once AI recommendations are loaded

#### Scenario: Recommendations error state
- **WHEN** AI recommendations fail to load
- **THEN** recommendation cards fall back to cost-based labels (e.g., "Lowest cost", "Best value")
- **AND** an error message is displayed indicating AI explanations are unavailable
- **AND** the page continues to function normally

#### Scenario: Recommendations styling
- **WHEN** viewing recommendations
- **THEN** recommendation cards are visually distinct from regular plan cards
- **AND** the section is clearly labeled and positioned after usage insights
- **AND** AI-generated explanations are prominently displayed
- **AND** pros/cons are displayed in a readable format (lists or sections)

#### Scenario: Preference selector in recommendations
- **WHEN** viewing the recommendations section
- **THEN** a preference selector is displayed above or within the recommendations section
- **AND** users can change preference (cost, flexibility, renewable)
- **AND** changing preference updates the displayed recommendations
- **AND** loading state is shown while new recommendations are being fetched

