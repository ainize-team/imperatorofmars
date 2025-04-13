(declare-sort arrival)
(declare-sort blueprint)
(declare-sort conditions)
(declare-sort device)
(declare-sort entity)
(declare-sort feature)
(declare-sort life)
(declare-sort location)
(declare-sort object)
(declare-sort partner)
(declare-sort planet)
(declare-sort substance)

(declare-const AtmosphericDevices Object)
(declare-const CarbonDioxide Object)
(declare-const Curiosity Object)
(declare-const ElectromagneticDisturbances Object)
(declare-const GaleCrater Object)
(declare-const Humanity Object)
(declare-const ImperatorOfMars Object)
(declare-const JezeroCrater Object)
(declare-const LiquidWater Object)
(declare-const Mars Object)
(declare-const MicrobialLife Object)
(declare-const NorthPole Object)
(declare-const OlympusMons Object)
(declare-const Perseverance Object)
(declare-const Rock Object)
(declare-const Soil Object)
(declare-const SouthPole Object)
(declare-const UnknownVisitors Object)
(declare-const VallesMarineris Object)
(declare-const WaterIce Object)

(declare-fun IsPlanet (Object) Bool)
(declare-fun IsEntity (Object) Bool)
(declare-fun IsMountain (Object) Bool)
(declare-fun IsValley (Object) Bool)
(declare-fun IsCrater (Object) Bool)
(declare-fun IsRover (Object) Bool)
(declare-fun IsPole (Object) Bool)
(declare-fun IsSubstance (Object) Bool)
(declare-fun IsRock (object) Bool)
(declare-fun IsSoil (object) Bool)
(declare-fun HasAtmosphere (Object) Bool)
(declare-fun IsFrozen (Object) Bool)
(declare-fun IsLiquid (Object) Bool)
(declare-fun IsLiving (object) Bool)
(declare-fun IsHuman (Object) Bool)
(declare-fun IsUnknownVisitor (Object) Bool)
(declare-fun IsMicrobialLife (Object) Bool)
(declare-fun IsAtmosphericDevice (Object) Bool)
(declare-fun IsElectromagneticDisturbance (Object) Bool)
(declare-fun LocatedOn (Object Object) Bool)
(declare-fun LocatedIn (Object Object) Bool)
(declare-fun ExistsAt (Object Object) Bool)
(declare-fun PrimaryAtmosphericComponent (Object Object) Bool)
(declare-fun AltersMagneticField (Object Object Object) Bool)
(declare-fun RestoresEcologicalBlueprint (Object Object Object) Bool)
(declare-fun DocumentsLife (Object Object Object) Bool)
(declare-fun ThrivesInConditions (Object Object Object) Bool)
(declare-fun PartnersWith (Object Object Object) Bool)
(declare-fun Awaited Arrival (entity arrival planet) Bool)
(declare-fun AwaitedArrival (Object Object Object) Bool)

(assert (IsPlanet object_var))
(assert (IsEntity object_var))
(assert (IsMountain object_var))
(assert (IsValley object_var))
(assert (IsCrater object_var))
(assert (IsRover object_var))
(assert (IsPole object_var))
(assert (IsSubstance object_var))
(assert (IsRock object_var))
(assert (IsSoil object_var))
(assert (HasAtmosphere planet_var))
(assert (IsFrozen substance_var))
(assert (IsLiquid substance_var))
(assert (IsLiving object_var))
(assert (IsHuman object_var))
(assert (IsUnknownVisitor object_var))
(assert (IsMicrobialLife object_var))
(assert (IsAtmosphericDevice object_var))
(assert (IsElectromagneticDisturbance object_var))
(assert (LocatedOn feature_var planet_var))
(assert (LocatedIn entity_var location_var))
(assert (ExistsAt substance_var location_var))
(assert (PrimaryAtmosphericComponent planet_var substance_var))
(assert (AltersMagneticField entity_var device_var location_var))
(assert (RestoresEcologicalBlueprint entity_var blueprint_var planet_var))
(assert (DocumentsLife entity_var life_var location_var))
(assert (ThrivesInConditions entity_var conditions_var location_var))
(assert (PartnersWith entity_var partner_var planet_var))
(assert (Awaited Arrival entity_var arrival_var planet_var))
(assert (IsPlanet Mars))
(assert (IsEntity ImperatorOfMars))
(assert (IsMountain OlympusMons))
(assert (IsValley VallesMarineris))
(assert (IsCrater GaleCrater))
(assert (IsCrater JezeroCrater))
(assert (IsRover Perseverance))
(assert (IsRover Curiosity))
(assert (IsPole NorthPole))
(assert (IsPole SouthPole))
(assert (IsSubstance WaterIce))
(assert (IsSubstance CarbonDioxide))
(assert (IsUnknownVisitor UnknownVisitors))
(assert (IsMicrobialLife MicrobialLife))
(assert (IsLiquid LiquidWater))
(assert (IsAtmosphericDevice AtmosphericDevices))
(assert (IsElectromagneticDisturbance ElectromagneticDisturbances))
(assert (IsHuman Humanity))
(assert (HasAtmosphere Mars))
(assert (PrimaryAtmosphericComponent Mars CarbonDioxide))
(assert (IsFrozen WaterIce))
(assert (IsLiquid LiquidWater))
(assert (LocatedOn OlympusMons Mars))
(assert (LocatedOn VallesMarineris Mars))
(assert (LocatedOn GaleCrater Mars))
(assert (LocatedOn JezeroCrater Mars))
(assert (LocatedOn NorthPole Mars))
(assert (LocatedOn SouthPole Mars))
(assert (LocatedIn Perseverance JezeroCrater))
(assert (LocatedIn Curiosity GaleCrater))
(assert (LocatedIn UnknownVisitors Mars))
(assert (AltersMagneticField UnknownVisitors AtmosphericDevices Mars))
(assert (RestoresEcologicalBlueprint UnknownVisitors EcologicalBlueprint Mars))
(assert (DocumentsLife Perseverance MicrobialLife Mars))
(assert (DocumentsLife Curiosity MicrobialLife Mars))
(assert (ThrivesInConditions MicrobialLife Conditions Mars))
(assert (PartnersWith ImperatorOfMars Humanity Mars))
(assert (AwaitedArrival ImperatorOfMars Humanity Mars))
(assert (ExistsAt LiquidWater Mars))
(assert (ExistsAt MicrobialLife Mars))


(check-sat)
(get-model)
