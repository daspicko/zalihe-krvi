import './BloodLevelIndicator.css'

// Image have some unused space at the top and bottom. This values are in percentage.
const BLOOD_BAG_FILLER_IMAGE_LIMITS = {
  top: 88,
  bottom: 24
}

const transformPercentageToImageHeight = (percentage) => {
  let sanitizedPercentage = parseFloat(percentage || 0);
  if (percentage < 0) {
    sanitizedPercentage = 0;
  } else if (percentage > 100) {
    sanitizedPercentage = 100;
  }

  const translatedPercentage = (BLOOD_BAG_FILLER_IMAGE_LIMITS.top - BLOOD_BAG_FILLER_IMAGE_LIMITS.bottom) * sanitizedPercentage / 100;
  return translatedPercentage + BLOOD_BAG_FILLER_IMAGE_LIMITS.bottom;
}

function BloodLevelIndicator(props) {

  return (
    <>
      <div className="location">
        <div className="location-header">
          { props.location ? <>
            <h3>{props.location?.name}</h3>
            { props.location?.address ? <> 
              <p>{props.location.address.street}, {props.location.address.postalCode} {props.location.address.city}</p> 
              <a href={props.location.dataUrl} target='blank'>Otvori stranicu</a> 
            </>: undefined }
          </> : undefined}      
        </div>

        <div className="legend">
          <div><span className='high-indicator'></span></div>
          <div>Prevelike zalihe</div>
          <div><span className='low-indicator'></span></div>
          <div>Premale zalihe</div>
        </div>

        <div className="blood-group">
          { props.location?.bloodGroups.map((group, index) => {
            return (
              <div key={index}>
                <div className="blood-bag">   
                  <div className='blood-bag-filler' style={{maskImage: `linear-gradient(to top, black ${transformPercentageToImageHeight(group.amountPercentage)}%, transparent 0%)`}}></div>
                  <div className='high-indicator' style={{bottom: `${transformPercentageToImageHeight(group.highPercentage)}%`}}></div>
                  <div className='low-indicator' style={{bottom: `${transformPercentageToImageHeight(group.lowPercentage)}%`}}></div>
                  <p className="blood-type">{group.type}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default BloodLevelIndicator
