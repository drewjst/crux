// Package sec provides a client for SEC EDGAR data.
package sec

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

const (
	baseURL        = "https://data.sec.gov"
	defaultTimeout = 30 * time.Second
	userAgent      = "Recon contact@example.com" // SEC requires User-Agent
)

// Client is the SEC EDGAR API client.
type Client struct {
	httpClient *http.Client
	baseURL    string
}

// Config holds SEC client configuration.
type Config struct {
	Timeout time.Duration
}

// NewClient creates a new SEC API client.
func NewClient(cfg Config) *Client {
	timeout := cfg.Timeout
	if timeout == 0 {
		timeout = defaultTimeout
	}

	return &Client{
		httpClient: &http.Client{
			Timeout: timeout,
		},
		baseURL: baseURL,
	}
}

// GetCompanyFacts retrieves company facts from SEC EDGAR.
// CIK should be zero-padded to 10 digits.
func (c *Client) GetCompanyFacts(ctx context.Context, cik string) (*CompanyFacts, error) {
	url := fmt.Sprintf("%s/api/xbrl/companyfacts/CIK%s.json", c.baseURL, cik)

	var facts CompanyFacts
	if err := c.get(ctx, url, &facts); err != nil {
		return nil, fmt.Errorf("fetching company facts: %w", err)
	}

	return &facts, nil
}

// GetSubmissions retrieves recent SEC filings for a company.
func (c *Client) GetSubmissions(ctx context.Context, cik string) (*Submissions, error) {
	url := fmt.Sprintf("%s/submissions/CIK%s.json", c.baseURL, cik)

	var submissions Submissions
	if err := c.get(ctx, url, &submissions); err != nil {
		return nil, fmt.Errorf("fetching submissions: %w", err)
	}

	return &submissions, nil
}

// get makes an HTTP GET request with required SEC headers.
func (c *Client) get(ctx context.Context, url string, dest any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}

	// SEC requires a User-Agent header
	req.Header.Set("User-Agent", userAgent)
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("SEC API returned status %d", resp.StatusCode)
	}

	if err := json.NewDecoder(resp.Body).Decode(dest); err != nil {
		return fmt.Errorf("decoding response: %w", err)
	}

	return nil
}

// CompanyFacts represents SEC EDGAR company facts.
type CompanyFacts struct {
	CIK        int                            `json:"cik"`
	EntityName string                         `json:"entityName"`
	Facts      map[string]map[string]FactData `json:"facts"`
}

// FactData contains units and values for a financial fact.
type FactData struct {
	Label       string     `json:"label"`
	Description string     `json:"description"`
	Units       FactUnits  `json:"units"`
}

// FactUnits contains the actual numerical data.
type FactUnits struct {
	USD []FactValue `json:"USD,omitempty"`
}

// FactValue is a single fact value with metadata.
type FactValue struct {
	Value  float64 `json:"val"`
	End    string  `json:"end"`
	Form   string  `json:"form"`
	Filed  string  `json:"filed"`
	Frame  string  `json:"frame,omitempty"`
	FY     int     `json:"fy,omitempty"`
	FP     string  `json:"fp,omitempty"`
}

// Submissions represents SEC EDGAR filing submissions.
type Submissions struct {
	CIK            string         `json:"cik"`
	EntityType     string         `json:"entityType"`
	Name           string         `json:"name"`
	Tickers        []string       `json:"tickers"`
	Exchanges      []string       `json:"exchanges"`
	SIC            string         `json:"sic"`
	SICDescription string         `json:"sicDescription"`
	Filings        RecentFilings  `json:"filings"`
}

// RecentFilings contains recent SEC filings.
type RecentFilings struct {
	Recent FilingList `json:"recent"`
}

// FilingList is a collection of filing metadata.
type FilingList struct {
	AccessionNumber []string `json:"accessionNumber"`
	FilingDate      []string `json:"filingDate"`
	Form            []string `json:"form"`
	PrimaryDocument []string `json:"primaryDocument"`
}
