# Comparison of different sources for EpiCurve / date of onset of illness
The following sources are compared:
* RKI daily situation reports digitized versions of fig. 3 on page 3 or 4. Contains EpiCurve: daily counts for known dates of onset and unknwons/asymptomatic (up to 13.04.2020) visit: http://www.mlinden.de/COVID19/ for more detailed review.
* RKI bulletin 09.04.2020 (https://www.rki.de/DE/Content/Infekt/EpidBull/Archiv/2020/17/Art_02.html) contains daily counts for knwon cases and some magic to distribute unknown/asymptomatic 
* RKI database counts from https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0 , assuming "Refdatum" is date of onset of illness. Data downloaded 13.04.2020 22:00

Observations:
* RKI arcgis Database download only contains datasets with both Refdatum and Meldedatum 91k vs. 123k cases currently reported by the RKI. Apparently only datasets with both Refdatum and Meldedatum, peak cases per day < 4500 compared to ~6000 max reported elsewhere
* 4 cases have Refdatum < 15.01.2020, 40 cases < 01.02.2020

## Disclaimer
Uses data supplied by https://github.com/Priesemann-Group/covid19_inference_forecast

## Meldedatum and Refdatum vs. arcgis Database Download
<p float="left">
	<img src="/page/graph/MeldeVsRefdatum.svg" height=500>
</p>
Comparison of Meldedatum and Refdatum from RKI's arcgis Database. Unfortunately only 91k of 123k cases
## Refdatum vs. EpiCurve
<p float="left">
	<img src="/page/graph/arcgisVsEpiCurve.svg" height=500>
</p>
Meldedatum > Refdatum is similar to EpiCurve from daily reports, but arcgis reports slightly lower numbers.
## EpiCurves from different KRI publications daily and 09.04.2020 bulletin
<p float="left">
	<img src="/page/graph/EpiCurveVSarcgisVSbulletin200409.svg" height=500>
</p>
EpiCurves from
## Residuals unknonw + asymptomatic vs. Refdatum==Meldedatum
<p float="left">
	<img src="/page/graph/UnknownsArcgisVsEpiCurve.svg" height=500>
</p>
Number of residual cases form arcgis is about half of unknown + asymptomatic from daily situation report. Imputated curve from 09.04.2020 Bulletin covers comparable case-number, but moves them at least a week earlier.
## Meldedatum vs. EpiCurve
<p float="left">
	<img src="/page/graph/EpiVsMeldung.svg" height=500>
</p>
## Shape of delay distribution
<p float="left">
	<img src="/page/graph/EpiVsMeldungDelay.svg" height=500>
</p>
Delay between Refdatum and Meldedatum for different cutoffs of maturity of Refdatum.

# Results:
* RKI's Arcgis RefDatum follows RKI's daily situation-report EpiCurve data closely, but reports up to 1000 cases more per day.
* If Meldedatum == Refdatum is excluded Arcgis reports aproximately the same number of cases as EpiCurve from daily situation-report.
* RKI's 09.04.2020 bulletin EpiCurve matches the one from the 09.04.2020 situation-report. case-Peaks that are present in the situation report seem to be smoothed somehow. The transformation of (unknown date + symptomatic) --> imputated further smoothes the EpiCurve.
* RKI's Nowcast forcast based on EpiCurve from 09.04.2020 follws the EpiCurve+unknonws as published in the situation reports up to ~23.03.2020 (1k cases difference)
* The cases with Meldedatum == RefDatum from arcgis and (unknowns + symptomatic) from daily situation-report match in structure (weekend-dips), with the arcis' cases ~1/2 of daily sit-report's. The Structure of imputated cases from 09.04.2020 bulletin differs.
* Meldedatum trails Refdatum by at least 5 days for > 50% of cases.