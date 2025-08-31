-- Create prompt_templates table for HAWK Agent Template Mode configuration
CREATE TABLE IF NOT EXISTS prompt_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    family_type VARCHAR(100) NOT NULL,
    template_category VARCHAR(100) NOT NULL,
    description TEXT,
    prompt_text TEXT NOT NULL,
    template_filters TEXT, -- Comma-separated filters for easy searching
    input_fields JSONB DEFAULT '[]'::jsonb, -- Array of input field names extracted from prompt_text
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    display_order INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    -- Indexes for better performance
    CONSTRAINT prompt_templates_name_unique UNIQUE (name, family_type)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_prompt_templates_family_type ON prompt_templates (family_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_status ON prompt_templates (status);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_display_order ON prompt_templates (display_order);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_at ON prompt_templates (created_at);

-- Create a GIN index for JSONB input_fields for efficient querying
CREATE INDEX IF NOT EXISTS idx_prompt_templates_input_fields ON prompt_templates USING GIN (input_fields);

-- Create a text search index for name, description, and template_filters
CREATE INDEX IF NOT EXISTS idx_prompt_templates_search ON prompt_templates USING GIN (
    to_tsvector('english', 
        COALESCE(name, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(template_filters, '')
    )
);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE prompt_templates 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_prompt_templates_updated_at
    BEFORE UPDATE ON prompt_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample templates for different family types
INSERT INTO prompt_templates (name, family_type, template_category, description, prompt_text, template_filters, display_order) VALUES 

-- Hedge Accounting Templates
('Hedge Effectiveness Analysis', 'hedge_accounting', 'effectiveness', 'Analyze hedge effectiveness for accounting compliance', 
'Perform a hedge effectiveness analysis for {{hedge_relationship}} involving {{hedged_item}} and {{hedging_instrument}}. 

Please analyze:
1. Prospective effectiveness test for the period {{period}}
2. Retrospective effectiveness test results
3. Critical terms matching assessment
4. Risk management objective: {{risk_objective}}
5. Hedge ratio: {{hedge_ratio}}

Consider the following factors:
- Entity: {{entity_name}}
- Currency: {{currency}}
- Notional amount: {{notional_amount}}
- Maturity date: {{maturity_date}}

Provide recommendations for {{recommendation_type}} based on the analysis.', 
'hedge,effectiveness,accounting,compliance,ASC815,IFRS9', 1),

('FX Forward Hedge Documentation', 'hedge_accounting', 'documentation', 'Generate hedge accounting documentation for FX forwards', 
'Generate comprehensive hedge accounting documentation for FX Forward transaction:

Transaction Details:
- Entity: {{entity_name}}
- Transaction Type: {{transaction_type}}
- Hedged Item: {{hedged_item}}
- Hedging Instrument: {{hedging_instrument}}
- Currency Pair: {{currency_pair}}
- Notional Amount: {{notional_amount}}
- Forward Rate: {{forward_rate}}
- Maturity: {{maturity_date}}
- Risk Being Hedged: {{risk_type}}

Please provide:
1. Risk management objective and strategy
2. Hedge designation memo
3. Critical terms comparison
4. Effectiveness testing methodology
5. Accounting entries for {{accounting_period}}', 
'fx,forward,hedge,documentation,currency,risk', 2),

-- Risk Management Templates
('VaR Calculation Request', 'risk_management', 'var_analysis', 'Calculate Value at Risk for portfolio positions', 
'Calculate Value at Risk (VaR) for the following portfolio:

Portfolio Details:
- Portfolio Name: {{portfolio_name}}
- Base Currency: {{base_currency}}
- Confidence Level: {{confidence_level}}%
- Time Horizon: {{time_horizon}} days
- Methodology: {{var_methodology}}

Positions to Include:
- Asset Class: {{asset_class}}
- Instruments: {{instruments}}
- Market Data Date: {{market_date}}
- Position Date: {{position_date}}

Additional Requirements:
- Include stress testing scenarios for {{stress_scenarios}}
- Breakdown by {{breakdown_type}}
- Compare with limit of {{risk_limit}}

Please provide detailed VaR calculation with methodology explanation and key assumptions.', 
'var,risk,portfolio,calculation,stress', 1),

('Credit Risk Assessment', 'risk_management', 'credit_analysis', 'Assess credit risk for counterparty exposure', 
'Perform credit risk assessment for counterparty exposure:

Counterparty Information:
- Counterparty Name: {{counterparty_name}}
- Credit Rating: {{credit_rating}}
- Country of Risk: {{country}}
- Industry Sector: {{industry}}

Exposure Details:
- Exposure Type: {{exposure_type}}
- Current Exposure: {{current_exposure}} {{currency}}
- Potential Future Exposure: {{potential_exposure}} {{currency}}
- Credit Support: {{credit_support}}
- Netting Agreement: {{netting_agreement}}

Assessment Requirements:
- Time horizon: {{time_horizon}}
- Recovery rate assumption: {{recovery_rate}}%
- Default probability: {{default_probability}}%

Analyze the credit risk metrics and provide recommendations for {{recommendation_focus}}.', 
'credit,risk,counterparty,exposure,rating', 2),

-- Compliance Templates
('Regulatory Compliance Check', 'compliance', 'regulatory', 'Check compliance with regulatory requirements', 
'Perform regulatory compliance assessment for:

Regulation/Standard: {{regulation_name}}
Entity: {{entity_name}}
Business Line: {{business_line}}
Reporting Period: {{reporting_period}}

Specific Requirements to Check:
- Rule/Section: {{rule_section}}
- Threshold Limits: {{threshold_limits}}
- Calculation Method: {{calculation_method}}
- Reporting Frequency: {{reporting_frequency}}

Current Position/Exposure:
- Amount: {{amount}} {{currency}}
- Date: {{position_date}}
- Counterparties: {{counterparties}}

Please verify compliance status and highlight any breaches or concerns regarding {{compliance_focus}}.', 
'compliance,regulatory,rules,reporting,threshold', 1),

-- Reporting Templates
('Monthly P&L Attribution', 'reporting', 'pnl_analysis', 'Generate P&L attribution report for monthly analysis', 
'Generate monthly P&L attribution analysis for:

Portfolio/Desk: {{portfolio_name}}
Reporting Period: {{start_date}} to {{end_date}}
Base Currency: {{base_currency}}

P&L Components to Analyze:
- Trading P&L: {{trading_pnl}}
- Mark-to-Market: {{mtm_pnl}}
- Carry/Funding: {{carry_pnl}}
- FX Translation: {{fx_pnl}}

Breakdown Requirements:
- By Product Type: {{product_types}}
- By Currency: {{currencies}}
- By Risk Factor: {{risk_factors}}
- By Strategy: {{strategy_type}}

Key Metrics:
- Total P&L: {{total_pnl}} {{currency}}
- VaR Utilization: {{var_utilization}}%
- Risk-Adjusted Return: {{risk_adjusted_return}}

Provide detailed attribution analysis with explanations for {{analysis_focus}}.', 
'pnl,attribution,monthly,analysis,trading', 1),

-- Analysis Templates
('Market Data Analysis', 'analysis', 'market_data', 'Analyze market data trends and patterns', 
'Perform market data analysis for:

Market/Instrument: {{market_instrument}}
Data Period: {{start_date}} to {{end_date}}
Frequency: {{data_frequency}}
Data Source: {{data_source}}

Analysis Type: {{analysis_type}}

Key Metrics to Calculate:
- Volatility ({{volatility_period}} period): {{volatility_method}}
- Correlation with: {{correlation_instruments}}
- Trend Analysis: {{trend_method}}
- Statistical Measures: {{statistical_measures}}

Market Conditions:
- Current Level: {{current_level}}
- Previous Period: {{previous_level}}
- Change: {{change_amount}} ({{change_percent}}%)

Focus Areas:
- {{focus_area_1}}
- {{focus_area_2}}
- {{focus_area_3}}

Provide comprehensive analysis with charts and recommendations for {{recommendation_type}}.', 
'market,data,analysis,volatility,correlation,trend', 1),

-- Operations Templates
('Trade Settlement Review', 'operations', 'settlement', 'Review trade settlement and operational processes', 
'Review trade settlement process for:

Trade Details:
- Trade ID: {{trade_id}}
- Trade Date: {{trade_date}}
- Settlement Date: {{settlement_date}}
- Counterparty: {{counterparty}}
- Instrument: {{instrument_type}}
- Notional: {{notional_amount}} {{currency}}

Settlement Instructions:
- Payment Method: {{payment_method}}
- Account Details: {{account_details}}
- Cutoff Times: {{cutoff_times}}
- Time Zone: {{timezone}}

Review Focus:
- {{review_focus}}
- Failed trades: {{failed_trades}}
- Exceptions: {{exceptions}}
- Confirmations status: {{confirmation_status}}

Operational Checks:
- Documentation: {{documentation_status}}
- Regulatory reporting: {{regulatory_status}}
- Risk limits: {{risk_limits_check}}

Provide settlement review summary and highlight any issues requiring {{escalation_type}}.', 
'settlement,operations,trade,counterparty,review', 1);

-- Grant necessary permissions (adjust based on your RLS policies)
-- ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE prompt_templates IS 'Configuration table for HAWK Agent prompt templates with support for dynamic input fields';
COMMENT ON COLUMN prompt_templates.input_fields IS 'JSON array of field names extracted from prompt_text using {{field_name}} syntax';
COMMENT ON COLUMN prompt_templates.template_filters IS 'Comma-separated keywords for template discovery and filtering';
COMMENT ON COLUMN prompt_templates.usage_count IS 'Number of times this template has been used in HAWK Agent sessions';