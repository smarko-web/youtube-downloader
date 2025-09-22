import Switch from 'react-switch';
import { TbMovie } from 'react-icons/tb';
import { HiOutlineScissors } from 'react-icons/hi2';
import { FaVideo } from 'react-icons/fa';

const ToggleSwitch = ({checked, handleChange}) => {
  return (
    <div>
      <label style={{ display: 'flex', gap: '.75em', flexDirection: 'column-reverse' }}>
        <span style={{color: 'white', fontSize: '.75em'}}>
          {checked ? 'Clipped Video' : 'Full Video'}
        </span>
        <Switch
          onChange={handleChange}
          checked={checked}
          onColor="#fff"
          onHandleColor="#e65326"
          handleDiameter={20}
          uncheckedIcon={<FaVideo color='#fff'/>}
          checkedIcon={<TbMovie/>}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 6px rgba(0, 0, 0, 0.2)"
          height={24}
          width={48}
        />
      </label>
    </div>
  );
}

export default ToggleSwitch;