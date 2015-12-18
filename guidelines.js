

1) Timeline
	- Current Time
		- Set resources to ((seconds - 7) * workers) - (((seconds - 7) * workers) % 5)

2) Select Unit
	- Check required structures
	- Check required supply
	- Check required resources
	- Check required production (Is it in use?)
		- Update supply
		- Update resources
	- Add unit to unit production ['array']
		- Display unit production group in order
			- Placed relevant to current time